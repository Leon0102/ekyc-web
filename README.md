# eKYC - Electronic Know Your Customer

Hệ thống xác thực danh tính điện tử (eKYC) sử dụng công nghệ nhận diện khuôn mặt với VGGFace2 và Deep Learning.

## 🚀 Demo

![eKYC Flow](resources/flow.jpg)

## ✨ Tính năng

- ✅ **Xác thực khuôn mặt** - So sánh khuôn mặt trong CMND/CCCD với ảnh selfie
- ✅ **Phát hiện khuôn mặt** - MTCNN face detection
- ✅ **Web Application** - React frontend với UI hiện đại
- ✅ **REST API** - FastAPI backend
- ✅ **Docker Support** - Chạy toàn bộ hệ thống với Docker
- ✅ **Camera Integration** - Chụp ảnh selfie trực tiếp trên web

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────┐
│         Docker Network (ekyc-network)    │
│                                          │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  ekyc-api    │    │  ekyc-web    │  │
│  │              │    │              │  │
│  │ FastAPI      │◄───┤ React + Nginx│  │
│  │ VGGFace2     │    │ Tailwind CSS │  │
│  │ Port: 8000   │    │ Port: 80     │  │
│  └──────────────┘    └──────────────┘  │
│         ▲                    ▲          │
└─────────┼────────────────────┼──────────┘
    Host:8000            Host:3000
```

## 📦 Công nghệ

### Backend
- **FastAPI** - Modern Python web framework
- **PyTorch** - Deep learning framework
- **VGGFace2** - Face recognition model
- **MTCNN** - Face detection
- **OpenCV** - Image processing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **react-webcam** - Camera integration
- **Nginx** - Web server

## 🚀 Quick Start với Docker

### Yêu cầu

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- **Model Weights** - [Download from Google Drive](https://drive.google.com/drive/folders/1-pEMok04-UqpeCi_yscUcIA6ytvxhvkG)

### Cài đặt Model Weights

1. Tải model weights từ Google Drive
2. Đặt vào thư mục:
   - `verification_models/weights/vggface2_weights.pt`
   - `liveness_detection/landmarks/shape_predictor_68_face_landmarks.dat`
   - `liveness_detection/landmarks/emotion_weights.pt`

### Chạy ứng dụng

```bash
# Build và chạy containers
run-docker-web.bat

# Hoặc manual
docker-compose -f docker-compose-web.yml up -d
```

### Truy cập

- **🌐 Web App**: http://localhost:3000
- **🔧 API**: http://localhost:8000
- **📖 API Docs**: http://localhost:8000/docs

## 🛠️ Quản lý

### Xem logs
```bash
docker-compose -f docker-compose-web.yml logs -f
```

### Dừng containers
```bash
stop-docker-web.bat
# hoặc
docker-compose -f docker-compose-web.yml down
```

### Rebuild
```bash
docker-rebuild.bat
# hoặc
docker-compose -f docker-compose-web.yml build --no-cache
```

## 📂 Cấu trúc Project

```
eKYC/
├── api.py                          # FastAPI backend
├── face_verification.py            # Face verification logic
├── challenge_response.py           # Challenge-response verification
├── facenet/                        # MTCNN face detection
├── verification_models/            # VGGFace2 models
│   ├── VGGFace2.py
│   └── weights/                    # Model weights (gitignored)
├── liveness_detection/             # Liveness detection
│   ├── blink_detection.py
│   ├── emotion_prediction.py
│   └── landmarks/                  # Model files (gitignored)
├── utils/                          # Utility functions
├── ekyc-web/                       # React frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── services/               # API services
│   │   └── utils/                  # Utilities
│   ├── Dockerfile                  # Frontend Docker image
│   └── nginx.conf                  # Nginx configuration
├── Dockerfile.api                  # Backend Docker image
├── docker-compose-web.yml          # Docker orchestration
├── run-docker-web.bat              # Run script
├── stop-docker-web.bat             # Stop script
└── docker-rebuild.bat              # Rebuild script
```

## 🎯 Workflow

1. **Upload CMND/CCCD** - Người dùng upload ảnh chứng minh thư
2. **Chụp Selfie** - Người dùng chụp ảnh selfie qua webcam hoặc upload
3. **Face Detection** - MTCNN phát hiện khuôn mặt trong cả 2 ảnh
4. **Feature Extraction** - VGGFace2 trích xuất đặc trưng khuôn mặt
5. **Verification** - So sánh độ tương đồng bằng Euclidean distance
6. **Result** - Trả về kết quả xác thực + confidence score

## 📊 API Endpoints

### `GET /`
Thông tin API

### `GET /health`
Health check - kiểm tra models đã load chưa

### `POST /verify`
Xác thực khuôn mặt

**Request:**
- `id_card`: File ảnh CMND/CCCD
- `selfie`: File ảnh selfie

**Response:**
```json
{
  "verified": true,
  "confidence": 0.3245,
  "threshold": 0.4,
  "match": true,
  "message": "Face verification completed successfully"
}
```

### `POST /detect-face`
Phát hiện khuôn mặt trong ảnh

## 🔧 Development

### Local Development (không dùng Docker)

Nếu muốn chạy local để development:

```bash
# Backend
pip install -r requirements-api.txt
python api.py

# Frontend
cd ekyc-web
npm install
npm run dev
```

## 📚 Tài liệu

- **[DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)** - Hướng dẫn nhanh Docker
- **[DOCKER_WEB_GUIDE.md](DOCKER_WEB_GUIDE.md)** - Hướng dẫn chi tiết Docker
- **[API_README.md](API_README.md)** - API Documentation

## 🤝 Contributing

Pull requests are welcome! Vui lòng mở issue trước để thảo luận thay đổi lớn.

## 📝 License

MIT License

## 🙏 Acknowledgments

- **VGGFace2** - Face recognition model
- **MTCNN** - Face detection
- **FastAPI** - Modern Python web framework
- **React** - UI framework

## 📧 Contact

Nếu có câu hỏi hoặc vấn đề, vui lòng tạo issue trên GitHub.

---

**Made with ❤️ using PyTorch, FastAPI, and React**
