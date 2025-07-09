# YouTube Upload Troubleshooting Guide

## Các vấn đề thường gặp và cách khắc phục

### 1. Lỗi Access Token
**Hiện tượng:** `401 Unauthorized` hoặc `403 Forbidden`

**Nguyên nhân:**
- Access token hết hạn
- Thiếu quyền upload YouTube
- Token không hợp lệ

**Cách khắc phục:**
- Kiểm tra token có scope `https://www.googleapis.com/auth/youtube.upload`
- Refresh token nếu hết hạn
- Đảm bảo kênh YouTube đã được verify

### 2. Lỗi Download Video
**Hiện tượng:** Không thể tải video từ URL

**Nguyên nhân:**
- URL không tồn tại hoặc không truy cập được
- File quá lớn
- Timeout

**Cách khắc phục:**
- Kiểm tra URL video có hoạt động không
- Đảm bảo file size không quá 128GB (giới hạn YouTube)
- Kiểm tra network connection

### 3. Lỗi YouTube API
**Hiện tượng:** Lỗi từ YouTube API

**Nguyên nhân phổ biến:**
- Quota exceeded (vượt giới hạn API)
- Invalid metadata
- Video format không được hỗ trợ

**Cách kiểm tra:**
```bash
# Chạy script debug
cd backend
python debug_youtube_upload.py
```

### 4. Lỗi Upload Size
**Hiện tượng:** Upload thất bại với file lớn

**Cách khắc phục:**
- File size tối đa: 128GB
- Thời lượng tối đa: 12 giờ
- Sử dụng chunked upload cho file > 50MB

### 5. Kiểm tra Logs
Xem logs chi tiết trong terminal để debug:

```bash
# Backend logs
cd backend
python -m uvicorn main:app --reload --log-level debug

# Hoặc xem logs trong container
docker logs backend-container
```

### 6. Test Connection
Sử dụng endpoint test để kiểm tra kết nối:

```javascript
// Frontend test
const result = await youtubeService.getConnectionStatus();
console.log('Connection status:', result);
```

```bash
# Backend test
curl -X POST "http://localhost:8000/video/youtube/test-connection" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -F "access_token=YOUR_YOUTUBE_ACCESS_TOKEN"
```

### 7. Environment Variables
Đảm bảo các biến môi trường được set đúng:

```bash
# Frontend (.env)
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
REACT_APP_CONVEASE_API_BASE_URL=http://127.0.0.1:8000

# Backend
YOUTUBE_API_KEY=your_youtube_api_key
```

### 8. Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Kiểm tra parameters |
| 401 | Unauthorized | Refresh access token |
| 403 | Forbidden | Kiểm tra permissions/quota |
| 408 | Timeout | Retry hoặc giảm file size |
| 500 | Server Error | Kiểm tra logs server |

### 9. Debug Steps
1. Kiểm tra access token validity
2. Verify video URL accessibility 
3. Test với file nhỏ trước
4. Kiểm tra network connection
5. Xem logs chi tiết
6. Test trên môi trường khác

### 10. Contact Support
Nếu vẫn gặp vấn đề, hãy cung cấp:
- Error messages đầy đủ
- Video URL và metadata
- Access token info (không bao gồm token thực)
- Logs từ backend
- Thông tin môi trường (OS, browser, etc.)
