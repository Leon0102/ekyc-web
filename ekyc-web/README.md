# eKYC Web Application

Ứng dụng web xác thực danh tính điện tử (eKYC) sử dụng React và FastAPI.

## Tính năng

- ✅ Upload ảnh CMND/CCCD
- ✅ Chụp ảnh selfie qua webcam hoặc upload
- ✅ Xác thực khuôn mặt sử dụng VGGFace2
- ✅ Giao diện đẹp, hiện đại với Tailwind CSS
- ✅ Hỗ trợ tiếng Việt
- ✅ Responsive design

## Yêu cầu

- Node.js 18+ và npm
- Python 3.10+ (cho backend API)
- Webcam (tùy chọn, nếu muốn chụp ảnh selfie)

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd ekyc-web
npm install
```

### 2. Cấu hình

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` nếu cần thay đổi URL của API backend.

### 3. Khởi động Backend API

Trước khi chạy React app, cần khởi động API backend:

```bash
# Từ thư mục gốc của project (eKYC)
python api.py
```

API sẽ chạy tại: http://localhost:8000

### 4. Khởi động React App

```bash
cd ekyc-web
npm run dev
```

Ứng dụng sẽ mở tại: http://localhost:3000

## Build cho Production

```bash
npm run build
```

File build sẽ được tạo trong thư mục `dist/`.

## Cấu trúc thư mục

```
ekyc-web/
├── src/
│   ├── components/          # React components
│   │   ├── ImageUpload.jsx
│   │   ├── CameraCapture.jsx
│   │   └── VerificationResult.jsx
│   ├── services/            # API services
│   │   └── api.js
│   ├── utils/               # Utility functions
│   │   └── imageUtils.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static files
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Endpoints

Backend API cung cấp các endpoints sau:

- `GET /` - Thông tin API
- `GET /health` - Health check
- `POST /verify` - Xác thực khuôn mặt
- `POST /detect-face` - Phát hiện khuôn mặt

## Công nghệ sử dụng

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **react-webcam** - Camera integration
- **axios** - HTTP client
- **lucide-react** - Icons

### Backend
- **FastAPI** - REST API framework
- **PyTorch** - Deep learning
- **VGGFace2** - Face verification model
- **MTCNN** - Face detection

## Hướng dẫn sử dụng

1. **Bước 1**: Tải ảnh CMND/CCCD
   - Nhấp vào vùng upload để chọn ảnh
   - Hoặc kéo thả ảnh vào vùng upload
   - Nhấn "Tiếp Theo"

2. **Bước 2**: Chụp/Tải ảnh Selfie
   - Tải ảnh từ máy tính, hoặc
   - Nhấn "Chụp Ảnh Selfie" để sử dụng webcam
   - Nhấn "Xác Thực"

3. **Kết quả**: Xem kết quả xác thực
   - Hiển thị trạng thái: Thành công/Thất bại
   - Độ tương đồng giữa 2 ảnh
   - Gợi ý nếu xác thực thất bại

## Xử lý lỗi

### API không kết nối được
- Kiểm tra API backend đã chạy chưa (port 8000)
- Kiểm tra file `.env` có đúng URL không

### Model weights không tìm thấy
- Đảm bảo đã tải model weights vào thư mục `verification_models/weights/`
- Xem hướng dẫn tại `API_README.md`

### Camera không hoạt động
- Cho phép trình duyệt truy cập camera
- Đảm bảo không có ứng dụng nào khác đang sử dụng camera

## License

MIT License

## Liên hệ

Nếu có câu hỏi hoặc vấn đề, vui lòng tạo issue trên GitHub.
