# Hướng Dẫn Chạy eKYC Web với Docker

## Tổng quan

Docker setup này sẽ chạy toàn bộ hệ thống eKYC bao gồm:
- **FastAPI Backend** (Python + PyTorch + VGGFace2)
- **React Frontend** (Node.js + Vite + Tailwind CSS)
- **Nginx** (Web server cho React app)

Tất cả đều đóng gói trong Docker containers, không cần cài đặt Python hay Node.js!

## Yêu cầu

Chỉ cần **Docker Desktop**:
- Windows: https://www.docker.com/products/docker-desktop
- Đảm bảo Docker Desktop đang chạy

## Kiến trúc Docker

```
┌─────────────────────────────────────────┐
│         Docker Network (ekyc-network)    │
│                                          │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  ekyc-api    │    │  ekyc-web    │  │
│  │              │    │              │  │
│  │ FastAPI      │◄───┤ React + Nginx│  │
│  │ Port: 8000   │    │ Port: 80     │  │
│  └──────────────┘    └──────────────┘  │
│         ▲                    ▲          │
└─────────┼────────────────────┼──────────┘
          │                    │
    Host:8000            Host:3000
```

## Cách chạy

### Option 1: Chạy tự động (Khuyên dùng)

Chỉ cần double-click vào file:
```
run-docker-web.bat
```

Script sẽ tự động:
1. ✅ Kiểm tra Docker đã cài chưa
2. ✅ Kiểm tra model weights
3. ✅ Build Docker images
4. ✅ Start containers
5. ✅ Mở browser tự động

### Option 2: Chạy manual

```bash
# Build images
docker-compose -f docker-compose-web.yml build

# Start containers
docker-compose -f docker-compose-web.yml up -d

# View logs
docker-compose -f docker-compose-web.yml logs -f

# Stop containers
docker-compose -f docker-compose-web.yml down
```

## Truy cập ứng dụng

Sau khi containers chạy thành công:

- **🌐 Web App**: http://localhost:3000
- **🔧 API Backend**: http://localhost:8000
- **📖 API Docs**: http://localhost:8000/docs

## Scripts có sẵn

| Script | Chức năng |
|--------|-----------|
| `run-docker-web.bat` | Build và chạy containers |
| `stop-docker-web.bat` | Dừng containers |
| `docker-rebuild.bat` | Rebuild lại images (khi có thay đổi code) |

## Cấu trúc Docker Files

```
eKYC/
├── docker-compose-web.yml      # Orchestration file
├── Dockerfile.api              # Backend API image
├── ekyc-web/
│   ├── Dockerfile              # Frontend React image
│   ├── nginx.conf              # Nginx config
│   └── .dockerignore
└── .dockerignore
```

## Docker Compose Services

### 1. ekyc-api (Backend)

**Image**: Python 3.10 slim
**Port**: 8000
**Volumes**:
- `./verification_models/weights` → Model weights
- `./liveness_detection/landmarks` → Liveness models

**Đặc điểm**:
- PyTorch CPU-only (nhẹ hơn CUDA)
- Auto health check mỗi 30s
- Auto restart nếu crash

### 2. ekyc-web (Frontend)

**Build**: Multi-stage (Node builder + Nginx production)
**Port**: 3000 (mapped to 80 inside container)
**Features**:
- Nginx với gzip compression
- API proxy qua `/api/`
- SPA routing support
- Static asset caching

## Ưu điểm của Docker

### ✅ Dễ dàng deploy
- Không cần cài Python, Node.js, dependencies
- Chỉ cần Docker Desktop
- Run anywhere (Windows, Mac, Linux, Cloud)

### ✅ Consistent environment
- Mọi người chạy cùng môi trường
- Không lo conflict dependencies
- Reproducible builds

### ✅ Easy scaling
- Có thể scale containers
- Load balancing dễ dàng
- Deploy lên cloud (AWS, GCP, Azure)

### ✅ Isolation
- Containers độc lập
- Không ảnh hưởng system
- Dễ dàng cleanup

## Quản lý Containers

### Xem logs

```bash
# All services
docker-compose -f docker-compose-web.yml logs -f

# Chỉ API
docker-compose -f docker-compose-web.yml logs -f ekyc-api

# Chỉ Web
docker-compose -f docker-compose-web.yml logs -f ekyc-web
```

### Kiểm tra status

```bash
docker-compose -f docker-compose-web.yml ps
```

### Restart service

```bash
# Restart tất cả
docker-compose -f docker-compose-web.yml restart

# Restart chỉ API
docker-compose -f docker-compose-web.yml restart ekyc-api
```

### Exec vào container

```bash
# Vào API container
docker exec -it ekyc_api bash

# Vào Web container
docker exec -it ekyc_web sh
```

## Build Process

### Backend API (Dockerfile.api)

```dockerfile
1. Base: python:3.10-slim
2. Install system dependencies (cmake, opencv)
3. Install Python packages:
   - FastAPI, uvicorn
   - PyTorch CPU-only
   - OpenCV, dlib
4. Copy code
5. Expose port 8000
6. Run: uvicorn api:app
```

**Thời gian build**: ~10-15 phút lần đầu

### Frontend (ekyc-web/Dockerfile)

Multi-stage build:

**Stage 1 - Builder:**
```dockerfile
1. Base: node:18-alpine
2. npm install dependencies
3. npm run build
4. Output: /app/dist
```

**Stage 2 - Production:**
```dockerfile
1. Base: nginx:alpine
2. Copy dist từ stage 1
3. Copy nginx.conf
4. Expose port 80
```

**Thời gian build**: ~5-8 phút lần đầu

## Nginx Configuration

React app được serve bởi Nginx với config:

- **SPA Routing**: Tất cả routes → `index.html`
- **API Proxy**: `/api/*` → `http://ekyc-api:8000/*`
- **Gzip**: Compress text files
- **Caching**: Static assets cache 1 năm
- **Upload Size**: Max 10MB

## Troubleshooting

### 1. Port đã được sử dụng

**Lỗi**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Giải pháp**:
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Hoặc đổi port trong docker-compose-web.yml
ports:
  - "3001:80"  # Đổi 3000 → 3001
```

### 2. Model weights không tìm thấy

**Lỗi**: `FileNotFoundError: vggface2_weights.pt`

**Giải pháp**:
- Tải weights từ Google Drive
- Đặt vào: `verification_models/weights/vggface2_weights.pt`
- Restart container: `docker-compose -f docker-compose-web.yml restart ekyc-api`

### 3. Build fails - Network issues

**Lỗi**: Timeout khi download packages

**Giải pháp**:
```bash
# Rebuild with no cache
docker-compose -f docker-compose-web.yml build --no-cache

# Hoặc dùng script
docker-rebuild.bat
```

### 4. Container crashes ngay sau khi start

```bash
# Xem logs để debug
docker logs ekyc_api
docker logs ekyc_web

# Hoặc
docker-compose -f docker-compose-web.yml logs
```

### 5. API không kết nối được từ Web

**Kiểm tra**:
1. Cả 2 containers đều running: `docker ps`
2. Health check API: `docker logs ekyc_api | grep healthy`
3. Network: `docker network inspect ekyc-network`

## Update Code

Sau khi thay đổi code:

### Option 1: Rebuild toàn bộ
```bash
docker-rebuild.bat
```

### Option 2: Rebuild chỉ service thay đổi
```bash
# Nếu sửa backend
docker-compose -f docker-compose-web.yml build ekyc-api
docker-compose -f docker-compose-web.yml up -d ekyc-api

# Nếu sửa frontend
docker-compose -f docker-compose-web.yml build ekyc-web
docker-compose -f docker-compose-web.yml up -d ekyc-web
```

## Deploy lên Production

### 1. Build production images

```bash
docker-compose -f docker-compose-web.yml build
```

### 2. Tag images

```bash
docker tag ekyc_api:latest your-registry/ekyc-api:v1.0
docker tag ekyc_web:latest your-registry/ekyc-web:v1.0
```

### 3. Push to registry

```bash
docker push your-registry/ekyc-api:v1.0
docker push your-registry/ekyc-web:v1.0
```

### 4. Deploy lên server

Có thể deploy lên:
- **Docker Swarm**
- **Kubernetes**
- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

## Environment Variables

### API (.env hoặc docker-compose)
```yaml
PYTHONUNBUFFERED=1
LOG_LEVEL=info
```

### Web (.env trong ekyc-web/)
```env
VITE_API_URL=http://localhost:8000
```

## Performance

### Image sizes:
- `ekyc-api`: ~2.5GB (PyTorch CPU)
- `ekyc-web`: ~50MB (Nginx alpine)

### Memory usage:
- API: ~1-2GB RAM
- Web: ~50MB RAM

### Startup time:
- API: ~30-60s (load models)
- Web: ~2-5s

## Clean Up

### Dừng và xóa containers
```bash
docker-compose -f docker-compose-web.yml down
```

### Xóa images
```bash
docker rmi ekyc_api ekyc_web
```

### Xóa tất cả (bao gồm volumes)
```bash
docker-compose -f docker-compose-web.yml down -v --rmi all
```

## So sánh: Local vs Docker

| Aspect | Local Development | Docker |
|--------|------------------|--------|
| Setup | Cài Python, Node, dependencies | Chỉ cần Docker |
| Thời gian setup | 30-60 phút | 15-20 phút |
| Môi trường | Có thể khác nhau | Consistent |
| Hot reload | ✅ Nhanh | ⚠️ Cần rebuild |
| Debug | ✅ Dễ | ⚠️ Phức tạp hơn |
| Deploy | Phức tạp | Dễ dàng |
| Scaling | Khó | Dễ |

## Kết luận

Docker setup này giúp bạn:

✅ **Chạy ngay**: Không cần cài Python/Node
✅ **Consistent**: Chạy giống nhau mọi nơi
✅ **Production-ready**: Sẵn sàng deploy
✅ **Easy maintenance**: Dễ update và rollback

**Recommended workflow**:
- **Development**: Local (nhanh hơn, dễ debug)
- **Testing/Staging**: Docker (giống production)
- **Production**: Docker (stable, scalable)

Chúc bạn sử dụng thành công! 🚀
