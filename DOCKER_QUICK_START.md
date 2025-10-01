# 🚀 Quick Start - Docker eKYC

## ✅ Đã chạy thành công!

Hệ thống eKYC của bạn đang chạy trong Docker:

### 🌐 Truy cập:

- **Web App**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 📦 Containers đang chạy:

```bash
✓ ekyc_api  - FastAPI Backend (Port 8000)
✓ ekyc_web  - React + Nginx (Port 3000)
```

## 🎯 Sử dụng Web App

1. Mở browser vào: http://localhost:3000
2. **Bước 1**: Upload ảnh CMND/CCCD
3. **Bước 2**: Chụp/Upload ảnh selfie
4. **Bước 3**: Xem kết quả xác thực

## 🛠️ Quản lý Containers

### Xem logs
```bash
# Xem tất cả logs
docker-compose -f docker-compose-web.yml logs -f

# Chỉ API
docker logs ekyc_api -f

# Chỉ Web
docker logs ekyc_web -f
```

### Kiểm tra status
```bash
docker-compose -f docker-compose-web.yml ps
```

### Restart
```bash
docker-compose -f docker-compose-web.yml restart
```

### Dừng containers
```bash
# Dừng
docker-compose -f docker-compose-web.yml stop

# Hoặc dùng script
stop-docker-web.bat

# Dừng và xóa containers
docker-compose -f docker-compose-web.yml down
```

### Chạy lại
```bash
docker-compose -f docker-compose-web.yml up -d

# Hoặc dùng script
run-docker-web.bat
```

## 🔄 Rebuild khi có thay đổi code

```bash
# Option 1: Dùng script
docker-rebuild.bat

# Option 2: Manual
docker-compose -f docker-compose-web.yml down
docker-compose -f docker-compose-web.yml build --no-cache
docker-compose -f docker-compose-web.yml up -d
```

## 📊 Kiểm tra API Health

```bash
# Trong browser
http://localhost:8000/health

# Hoặc dùng curl
curl http://localhost:8000/health
```

## 🐛 Troubleshooting

### Web app không load được?

```bash
# Kiểm tra web container
docker logs ekyc_web

# Restart
docker-compose -f docker-compose-web.yml restart ekyc-web
```

### API trả lỗi?

```bash
# Xem logs API
docker logs ekyc_api

# Kiểm tra models đã load chưa
docker logs ekyc_api | grep "loaded successfully"
```

### Muốn vào trong container?

```bash
# Vào API container
docker exec -it ekyc_api bash

# Vào Web container
docker exec -it ekyc_web sh
```

## 📁 Cấu trúc Docker

```
docker-compose-web.yml      → Main orchestration file
├── ekyc-api                → FastAPI Backend
│   ├── Port: 8000
│   ├── Image: ekyc-ekyc-api
│   └── Models mounted from host
└── ekyc-web                → React Frontend
    ├── Port: 3000 → 80
    ├── Image: ekyc-ekyc-web
    └── Nginx serving static files
```

## 🔐 Model Weights

Models được mount từ host vào container:
- `./verification_models/weights` → `/app/verification_models/weights`
- `./liveness_detection/landmarks` → `/app/liveness_detection/landmarks`

## 💡 Tips

1. **Xem logs real-time**: `docker-compose -f docker-compose-web.yml logs -f`
2. **Check resource usage**: `docker stats`
3. **Clean up old images**: `docker image prune`
4. **View all containers**: `docker ps -a`

## 🎉 Xong!

Hệ thống eKYC đã sẵn sàng sử dụng!

Web App: **http://localhost:3000** 🚀

---

Xem hướng dẫn chi tiết tại: **DOCKER_WEB_GUIDE.md**
