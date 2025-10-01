"""
eKYC Face Verification API
REST API for face verification using ID card and selfie images
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import cv2
import numpy as np
from PIL import Image
import io
import torch
from typing import Optional, List
import logging
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from bson import ObjectId
import base64

from face_verification import verify
from facenet.models.mtcnn import MTCNN
from verification_models import VGGFace2

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
SECRET_KEY = "ekyc-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Admin credentials (hardcoded)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# Initialize FastAPI
app = FastAPI(
    title="eKYC Face Verification API",
    description="API for face verification using ID card and selfie images",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models (loaded once at startup)
device = None
mtcnn = None
verification_model = None
mongodb_client = None
db = None


@app.on_event("startup")
async def load_models():
    """Load ML models and connect to MongoDB on startup"""
    global device, mtcnn, verification_model, mongodb_client, db

    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/ekyc")
    try:
        mongodb_client = MongoClient(mongodb_url)
        db = mongodb_client.get_database()
        logger.info(f"Connected to MongoDB: {mongodb_url}")

        # Create indexes
        db.verifications.create_index([("timestamp", -1)])
        db.verifications.create_index([("verified", 1)])
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.warning("API will work but verification history will not be saved")

    logger.info("Loading models...")

    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")

    # Load MTCNN for face detection
    mtcnn = MTCNN(device=device)
    logger.info("MTCNN loaded successfully")

    # Load VGGFace2 model for verification
    try:
        verification_model = VGGFace2.load_model(device=device)
        logger.info("VGGFace2 model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load VGGFace2 model: {e}")
        logger.warning("Model weights may be missing. API will return errors for verification requests.")

    logger.info("All models loaded successfully")


def load_image_from_upload(file_content: bytes) -> np.ndarray:
    """Convert uploaded file to numpy array (OpenCV format)"""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(file_content))

        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Convert PIL Image to numpy array
        image_np = np.array(image)

        # Convert RGB to BGR (OpenCV format)
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        return image_bgr
    except Exception as e:
        logger.error(f"Error loading image: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")


def image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "eKYC Face Verification API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "POST /verify": "Verify face between ID card and selfie",
            "GET /health": "Health check",
            "GET /docs": "API documentation (Swagger UI)",
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = verification_model is not None and mtcnn is not None

    return {
        "status": "healthy" if models_loaded else "degraded",
        "models_loaded": models_loaded,
        "device": str(device) if device else "not initialized",
        "mtcnn": mtcnn is not None,
        "verification_model": verification_model is not None
    }


@app.post("/verify")
async def verify_face(
    id_card: UploadFile = File(..., description="ID card image with face"),
    selfie: UploadFile = File(..., description="Selfie image for verification")
):
    """
    Verify if the face in the selfie matches the face in the ID card

    Args:
        id_card: Image file of ID card containing a face
        selfie: Image file of selfie to verify

    Returns:
        JSON response with verification result and confidence score
    """

    # Check if models are loaded
    if verification_model is None or mtcnn is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please ensure model weights are available."
        )

    try:
        # Read uploaded files
        logger.info(f"Processing verification request - ID: {id_card.filename}, Selfie: {selfie.filename}")

        id_card_content = await id_card.read()
        selfie_content = await selfie.read()

        # Validate file sizes
        if len(id_card_content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="ID card image too large (max 10MB)")

        if len(selfie_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Selfie image too large (max 10MB)")

        # Load images
        id_image = load_image_from_upload(id_card_content)
        selfie_image = load_image_from_upload(selfie_content)

        logger.info(f"Images loaded - ID: {id_image.shape}, Selfie: {selfie_image.shape}")

        # Perform verification
        result = verify(
            id_image,
            selfie_image,
            mtcnn,
            verification_model,
            model_name="VGG-Face2"
        )

        logger.info(f"Verification result: {result}")

        # Prepare response
        response = {
            "verified": bool(result.get("verified", False)),
            "confidence": float(result.get("distance", 0.0)),
            "threshold": float(result.get("threshold", 0.4)),
            "match": result.get("verified", False),
            "message": "Face verification completed successfully"
        }

        # Save to MongoDB
        if db is not None:
            try:
                verification_doc = {
                    "timestamp": datetime.utcnow(),
                    "verified": response["verified"],
                    "confidence": response["confidence"],
                    "threshold": response["threshold"],
                    "id_card_filename": id_card.filename,
                    "selfie_filename": selfie.filename,
                    "id_card_image": image_to_base64(id_card_content),
                    "selfie_image": image_to_base64(selfie_content),
                }
                db.verifications.insert_one(verification_doc)
                logger.info(f"Verification saved to database")
            except Exception as e:
                logger.error(f"Failed to save verification to database: {e}")

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


@app.post("/detect-face")
async def detect_face(
    image: UploadFile = File(..., description="Image to detect face in")
):
    """
    Detect face in an image

    Args:
        image: Image file to detect face in

    Returns:
        JSON response with face detection result
    """

    if mtcnn is None:
        raise HTTPException(
            status_code=503,
            detail="Face detection model not loaded"
        )

    try:
        # Read and load image
        image_content = await image.read()
        img = load_image_from_upload(image_content)

        # Convert to RGB for MTCNN
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Detect face
        boxes, probs = mtcnn.detect(img_rgb)

        if boxes is not None and len(boxes) > 0:
            faces = []
            for box, prob in zip(boxes, probs):
                faces.append({
                    "bbox": box.tolist(),
                    "confidence": float(prob)
                })

            return JSONResponse(content={
                "faces_detected": len(faces),
                "faces": faces,
                "message": f"Detected {len(faces)} face(s)"
            })
        else:
            return JSONResponse(content={
                "faces_detected": 0,
                "faces": [],
                "message": "No faces detected"
            })

    except Exception as e:
        logger.error(f"Face detection error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Face detection failed: {str(e)}"
        )


# =============== ADMIN ENDPOINTS ===============

@app.post("/admin/login")
async def admin_login(
    username: str = Form(...),
    password: str = Form(...)
):
    """
    Admin login endpoint

    Args:
        username: Admin username
        password: Admin password

    Returns:
        Access token for admin operations
    """
    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": username
    }


@app.get("/admin/verifications")
async def get_verifications(
    skip: int = 0,
    limit: int = 50,
    username: str = Depends(verify_token)
):
    """
    Get list of all verifications (admin only)

    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        username: Verified admin username from token

    Returns:
        List of verification records
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available"
        )

    try:
        # Get verifications from database
        verifications = list(
            db.verifications
            .find()
            .sort("timestamp", -1)
            .skip(skip)
            .limit(limit)
        )

        # Get total count
        total_count = db.verifications.count_documents({})

        # Convert ObjectId to string
        for v in verifications:
            v["_id"] = str(v["_id"])
            v["timestamp"] = v["timestamp"].isoformat()

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "verifications": verifications
        }

    except Exception as e:
        logger.error(f"Failed to fetch verifications: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch verifications: {str(e)}"
        )


@app.get("/admin/stats")
async def get_stats(username: str = Depends(verify_token)):
    """
    Get statistics about verifications (admin only)

    Args:
        username: Verified admin username from token

    Returns:
        Statistics about verifications
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available"
        )

    try:
        total = db.verifications.count_documents({})
        verified = db.verifications.count_documents({"verified": True})
        not_verified = db.verifications.count_documents({"verified": False})

        # Get average confidence
        pipeline = [
            {"$group": {
                "_id": None,
                "avg_confidence": {"$avg": "$confidence"}
            }}
        ]
        avg_result = list(db.verifications.aggregate(pipeline))
        avg_confidence = avg_result[0]["avg_confidence"] if avg_result else 0

        return {
            "total_verifications": total,
            "verified_count": verified,
            "not_verified_count": not_verified,
            "verification_rate": (verified / total * 100) if total > 0 else 0,
            "average_confidence": avg_confidence
        }

    except Exception as e:
        logger.error(f"Failed to fetch stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch stats: {str(e)}"
        )


@app.delete("/admin/verifications/{verification_id}")
async def delete_verification(
    verification_id: str,
    username: str = Depends(verify_token)
):
    """
    Delete a verification record (admin only)

    Args:
        verification_id: ID of verification to delete
        username: Verified admin username from token

    Returns:
        Success message
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available"
        )

    try:
        result = db.verifications.delete_one({"_id": ObjectId(verification_id)})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Verification not found"
            )

        return {"message": "Verification deleted successfully"}

    except Exception as e:
        logger.error(f"Failed to delete verification: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete verification: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    # Run the API
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
