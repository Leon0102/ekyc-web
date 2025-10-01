# 🔐 eKYC Admin Panel Guide

## ✨ Tính năng Admin

Hệ thống Admin Panel đã được tích hợp vào eKYC Web App với các tính năng:

- ✅ **Đăng nhập Admin** - Username/Password hardcode
- ✅ **Dashboard** - Xem stats tổng quan
- ✅ **Lịch sử xác thực** - List tất cả verifications
- ✅ **Xem ảnh** - Xem CMND và Selfie của từng verification
- ✅ **Xóa bản ghi** - Quản lý data
- ✅ **Pagination** - Phân trang 20 records/page
- ✅ **MongoDB** - Lưu trữ lịch sử xác thực

## 🚀 Truy cập

### User App (eKYC)
```
URL: http://localhost:3000
Chức năng: Upload CMND + Selfie → Xác thực
```

### Admin Panel
```
URL: http://localhost:3000/admin
Username: admin
Password: admin123
```

## 📊 Admin Dashboard

### Stats Cards
- **Tổng xác thực** - Tổng số lượt verification
- **Thành công** - Số lượng verified = true
- **Thất bại** - Số lượng verified = false
- **Tỷ lệ thành công** - % verification thành công

### Bảng lịch sử
Hiển thị thông tin:
- Thời gian xác thực
- Nút xem ảnh CMND/CCCD
- Nút xem ảnh Selfie
- Kết quả (Thành công/Thất bại)
- Độ chính xác (%)
- Nút xóa bản ghi

## 🗄️ Database - MongoDB

### Connection
```
Host: localhost:27017
Database: ekyc
Collection: verifications
```

### Schema
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  verified: Boolean,
  confidence: Number,      // Distance value
  threshold: Number,       // Threshold value (default 0.4)
  id_card_filename: String,
  selfie_filename: String,
  id_card_image: String,   // Base64 encoded
  selfie_image: String     // Base64 encoded
}
```

## 🔐 Authentication

### Hardcoded Credentials
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Có thể thay đổi trong `docker-compose-web.yml`:
```yaml
environment:
  - ADMIN_USERNAME=admin
  - ADMIN_PASSWORD=admin123
```

### JWT Token
- **Algorithm**: HS256
- **Expiry**: 24 hours
- **Storage**: localStorage
- **Auto redirect**: Khi token hết hạn → về trang login

## 📡 API Endpoints

### Public Endpoints
```
POST /verify              # Xác thực khuôn mặt
POST /detect-face         # Phát hiện khuôn mặt
GET  /health              # Health check
GET  /                    # API info
```

### Admin Endpoints (Require JWT)
```
POST   /admin/login                     # Đăng nhập admin
GET    /admin/verifications?skip&limit  # Lấy danh sách
GET    /admin/stats                     # Statistics
DELETE /admin/verifications/:id         # Xóa bản ghi
```

### Example: Login
```bash
curl -X POST http://localhost:8000/admin/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

Response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "username": "admin"
}
```

### Example: Get Verifications
```bash
curl -X GET http://localhost:8000/admin/verifications?skip=0&limit=20 \
  -H "Authorization: Bearer eyJ..."
```

## 🎯 Workflow

### User Flow
```
1. Vào http://localhost:3000
2. Upload ảnh CMND/CCCD
3. Chụp/Upload ảnh Selfie
4. Nhấn "Xác Thực"
5. Xem kết quả
→ Dữ liệu tự động lưu vào MongoDB
```

### Admin Flow
```
1. Vào http://localhost:3000/admin
2. Đăng nhập với admin/admin123
3. Xem dashboard với stats
4. Browse lịch sử verifications
5. Click "Xem" để xem ảnh
6. Click "Xóa" để delete bản ghi
7. Phân trang với "Trước/Sau"
```

## 🔧 Cấu trúc Routes

```
/                    → HomePage (User eKYC)
/admin               → AdminLogin
/admin/dashboard     → AdminDashboard (Protected)
```

## 💾 Data Flow

```
User submits verification
         ↓
   API processes
         ↓
   Verify faces
         ↓
   Save to MongoDB
         ↓
   Return result
         ↓
Admin can view in dashboard
```

## 📱 Responsive Design

- **Mobile**: Hiển thị tốt trên điện thoại
- **Tablet**: Layout tối ưu
- **Desktop**: Full features

## 🛡️ Security Features

### Frontend
- Protected routes với React Router
- Token check trước mỗi API call
- Auto logout khi unauthorized

### Backend
- JWT authentication
- Password hashing ready (hardcode hiện tại)
- CORS enabled cho local development
- Request validation

## 📸 Image Handling

### Storage
- Ảnh được lưu dưới dạng Base64 trong MongoDB
- Hiển thị trực tiếp trong admin panel
- Click để xem full size

### Optimization
- Ảnh được compress khi upload
- Lazy loading images
- Modal preview

## 🔄 Real-time Updates

- Nút "Làm mới" để reload data
- Auto fetch khi change page
- Stats update mỗi lần load

## 🎨 UI/UX Features

- Modern gradient design
- Tailwind CSS styling
- Lucide React icons
- Loading states
- Error handling
- Confirmation dialogs
- Toast notifications ready

## 📊 Statistics Calculation

```javascript
total_verifications = count all documents
verified_count = count where verified = true
not_verified_count = count where verified = false
verification_rate = (verified / total) * 100
average_confidence = avg(confidence)
```

## 🚧 Future Enhancements

Có thể thêm:
- [ ] Export data to Excel
- [ ] Filter by date range
- [ ] Search functionality
- [ ] Multiple admin users
- [ ] Role-based permissions
- [ ] Email notifications
- [ ] Audit logs
- [ ] Data analytics charts

## 💡 Tips

1. **Đăng nhập lần đầu**: Dùng `admin/admin123`
2. **Xem ảnh**: Click nút "Xem" ở cột tương ứng
3. **Xóa**: Có confirm dialog trước khi xóa
4. **Phân trang**: Mỗi trang 20 records
5. **Logout**: Nhấn nút "Đăng xuất" ở header

## 🔗 Quick Links

- **User App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health
- **MongoDB**: mongodb://localhost:27017/ekyc

---

**Happy Managing! 🎉**
