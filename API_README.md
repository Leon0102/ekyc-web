# eKYC Face Verification API

REST API for face verification using ID card and selfie images.

## 🚀 Quick Start

### Option 1: Run with Docker (Recommended)

```bash
# Build and run
docker-compose -f docker-compose-api.yml up --build

# Or use the script
start-api.bat docker
```

API will be available at: `http://localhost:8000`

### Option 2: Run Locally

```bash
# Install dependencies
pip install -r requirements-api.txt

# Start the API
uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# Or use the script
start-api.bat local
```

## 📡 API Endpoints

### 1. Root - GET /

Get API information

```bash
curl http://localhost:8000/
```

### 2. Health Check - GET /health

Check if API and models are loaded

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "device": "cpu",
  "mtcnn": true,
  "verification_model": true
}
```

### 3. Face Verification - POST /verify

Verify if selfie matches ID card photo

```bash
curl -X POST http://localhost:8000/verify \
  -F "id_card=@path/to/id_card.jpg" \
  -F "selfie=@path/to/selfie.jpg"
```

Response:
```json
{
  "verified": true,
  "confidence": 0.35,
  "threshold": 0.4,
  "match": true,
  "message": "Face verification completed successfully"
}
```

### 4. Face Detection - POST /detect-face

Detect faces in an image

```bash
curl -X POST http://localhost:8000/detect-face \
  -F "image=@path/to/image.jpg"
```

Response:
```json
{
  "faces_detected": 1,
  "faces": [
    {
      "bbox": [100, 150, 300, 400],
      "confidence": 0.9995
    }
  ],
  "message": "Detected 1 face(s)"
}
```

## 📚 API Documentation

Interactive API documentation (Swagger UI):
```
http://localhost:8000/docs
```

Alternative documentation (ReDoc):
```
http://localhost:8000/redoc
```

## 🧪 Testing

### Using Python Test Script

```bash
# Test basic endpoints
python test_api.py

# Test with sample images
python test_api.py id_card.jpg selfie.jpg
```

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Verify faces
curl -X POST http://localhost:8000/verify \
  -F "id_card=@samples/id_card.jpg" \
  -F "selfie=@samples/selfie.jpg"
```

### Using Python requests

```python
import requests

# Verify faces
with open('id_card.jpg', 'rb') as id_card, open('selfie.jpg', 'rb') as selfie:
    files = {
        'id_card': id_card,
        'selfie': selfie
    }
    response = requests.post('http://localhost:8000/verify', files=files)
    print(response.json())
```

### Using Postman or Insomnia

1. Create a POST request to `http://localhost:8000/verify`
2. Set body type to `multipart/form-data`
3. Add two file fields:
   - `id_card`: Upload ID card image
   - `selfie`: Upload selfie image
4. Send request

## 🐳 Docker Commands

```bash
# Build image
docker build -f Dockerfile.api -t ekyc-api .

# Run container
docker run -p 8000:8000 -v $(pwd)/verification_models/weights:/app/verification_models/weights ekyc-api

# Using docker-compose
docker-compose -f docker-compose-api.yml up --build

# Stop
docker-compose -f docker-compose-api.yml down

# View logs
docker-compose -f docker-compose-api.yml logs -f
```

## 📦 Model Weights

Download model weights and place them in:
- `verification_models/weights/` - VGGFace2 model weights
- `liveness_detection/landmarks/` - Liveness detection models

Download from Google Drive:
- VGGFace: https://drive.google.com/drive/folders/1-pEMok04-UqpeCi_yscUcIA6ytvxhvkG
- Liveness: https://drive.google.com/drive/folders/1S6zLU8_Cgode7B7mfJWs9oforfAODaGB

## 🔧 Configuration

### Port Configuration

Change port in `docker-compose-api.yml`:
```yaml
ports:
  - "8080:8000"  # Use port 8080 instead
```

Or when running locally:
```bash
uvicorn api:app --port 8080
```

### GPU Support (Optional)

To use GPU instead of CPU:

1. Update `requirements-api.txt`:
```
torch==2.5.1  # Remove +cpu
torchvision==0.20.1  # Remove +cpu
```

2. Update `Dockerfile.api` to use CUDA base image:
```dockerfile
FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04
```

3. Run with GPU support:
```bash
docker run --gpus all -p 8000:8000 ekyc-api
```

## 🎯 Performance

- **First request**: ~2-5 seconds (model loading)
- **Subsequent requests**: ~0.5-1 second per verification
- **Concurrent requests**: Supports multiple simultaneous requests

## 🚨 Common Issues

### Issue: "Models not loaded"

**Solution**:
- Ensure model weights are in `verification_models/weights/`
- Check logs: `docker-compose logs ekyc-api`

### Issue: Port already in use

**Solution**:
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process or change port
```

### Issue: High memory usage

**Solution**:
- Use CPU version of PyTorch (already configured)
- Limit Docker memory: `docker run -m 4g ...`

## 📊 API Response Codes

- `200`: Success
- `400`: Bad request (invalid image format)
- `503`: Service unavailable (models not loaded)
- `500`: Internal server error

## 🔒 Security Considerations

For production deployment:
1. Add authentication (API keys, JWT)
2. Add rate limiting
3. Validate image sizes and formats
4. Use HTTPS
5. Add input sanitization
6. Monitor for abuse

## 📝 Example Integration

### JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('id_card', idCardFile);
formData.append('selfie', selfieFile);

fetch('http://localhost:8000/verify', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### React Example

```jsx
const verifyFace = async (idCard, selfie) => {
  const formData = new FormData();
  formData.append('id_card', idCard);
  formData.append('selfie', selfie);

  const response = await fetch('http://localhost:8000/verify', {
    method: 'POST',
    body: formData
  });

  return await response.json();
};
```

## 🎉 Advantages over GUI App

✅ Easy to deploy with Docker (with port!)
✅ Can be used from any programming language
✅ Scalable - can handle multiple requests
✅ No GUI dependencies (no PyQt5, X11, etc.)
✅ Works on servers without display
✅ Can be integrated into web/mobile apps
✅ RESTful interface - standard HTTP
✅ Automatic API documentation

## 🔄 Next Steps

1. Add authentication
2. Add rate limiting
3. Add request logging
4. Deploy to cloud (AWS, GCP, Azure)
5. Add monitoring (Prometheus, Grafana)
6. Add CI/CD pipeline
7. Add unit tests
