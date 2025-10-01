"""
eKYC Face Verification API
REST API for face verification using ID card and selfie images
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from PIL import Image
import io
import torch
from typing import Optional
import logging

from face_verification import verify
from facenet.models.mtcnn import MTCNN
from verification_models import VGGFace2

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


@app.on_event("startup")
async def load_models():
    """Load ML models on startup"""
    global device, mtcnn, verification_model

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
