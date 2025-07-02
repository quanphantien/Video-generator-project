# Authentication System - Frontend

Hệ thống xác thực frontend được tích hợp với backend API FastAPI.

## Các tính năng

### 1. Đăng ký (Register)
- **Route**: `/register`
- **Component**: `src/components/a5_Register/Register.js`
- **Tính năng**:
  - Đăng ký bằng email/password
  - Đăng ký bằng Google OAuth
  - Validation form
  - Error handling
  - Auto redirect sau khi đăng ký thành công

### 2. Đăng nhập (Login)
- **Route**: `/login`
- **Component**: `src/components/a4_Login/Login.js`
- **Tính năng**:
  - Đăng nhập bằng email/password
  - Đăng nhập bằng Google OAuth
  - Validation form
  - Error handling
  - Auto redirect sau khi đăng nhập thành công

### 3. Authentication Service
- **File**: `src/services/authService.js`
- **Tính năng**:
  - Axios interceptors cho auto token refresh
  - API calls với authentication headers
  - Token management (access token, refresh token)
  - Auto logout khi token hết hạn

### 4. Custom Hooks cho API
- **File**: `src/hooks/useApi.js`
- **Hooks**:
  - `useApi`: Generic API calls
  - `useProtectedApi`: Protected API calls với authentication
  - `useGet`: GET requests
  - `usePost`: POST requests
  - `usePut`: PUT requests
  - `useDelete`: DELETE requests

### 5. Protected Routes
- **Component**: `src/components/ProtectedRoute.js`
- **Tính năng**:
  - Bảo vệ routes yêu cầu authentication
  - Redirect đến login nếu chưa đăng nhập
  - Support cho routes public và private

### 6. User Profile
- **Component**: `src/components/UserProfile/UserProfile.js`
- **Tính năng**:
  - Hiển thị thông tin user từ backend
  - Sử dụng protected API `/auth/me`
  - Loading states và error handling

### 7. API Demo
- **Route**: `/api-demo`
- **Component**: `src/components/ProtectedApiDemo/ProtectedApiDemo.js`
- **Tính năng**:
  - Demo gọi các protected APIs
  - Predefined endpoints
  - Custom API calls
  - Response display
  - Authentication status check

## Cách sử dụng

### 1. Khởi chạy Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Khởi chạy Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Test Authentication Flow

1. **Đăng ký tài khoản mới**:
   - Vào `http://localhost:3000/register`
   - Nhập thông tin hoặc dùng Google OAuth

2. **Đăng nhập**:
   - Vào `http://localhost:3000/login`
   - Nhập thông tin đã đăng ký

3. **Truy cập Dashboard**:
   - Sau khi đăng nhập thành công, sẽ redirect đến `/dashboard`
   - Xem thông tin user profile
   - Test API calls

4. **Demo Protected API**:
   - Trong Dashboard, click "Demo API"
   - Test các endpoint được bảo vệ
   - Xem response và error handling

## API Endpoints được sử dụng

### Authentication
- `POST /auth/register` - Đăng ký với email/password
- `POST /auth/login` - Đăng nhập với email/password
- `POST /auth/login/google` - Đăng nhập với Google
- `GET /auth/me` - Lấy thông tin user hiện tại
- `POST /auth/refresh` - Refresh access token

### Protected APIs (cần authentication)
- `GET /videos` - Lấy danh sách videos
- `GET /statistics` - Lấy thống kê
- `GET /trends` - Lấy xu hướng

## Token Management

### Access Token
- Được lưu trong `localStorage` với key `accessToken`
- Tự động gửi trong header `Authorization: Bearer <token>`
- Hết hạn sau thời gian nhất định

### Refresh Token
- Được lưu trong `localStorage` với key `refreshToken`
- Dùng để refresh access token khi hết hạn
- Tự động xử lý trong axios interceptor

### Auto Logout
- Khi refresh token cũng hết hạn
- Clear tất cả tokens và user data
- Redirect về trang login

## Error Handling

### Frontend
- Validation errors hiển thị dưới form fields
- Server errors hiển thị dưới dạng alerts
- Network errors được catch và hiển thị

### Backend Integration
- Parse error responses từ FastAPI
- Hiển thị field-specific errors
- Handle HTTP status codes

## Security Features

### Frontend
- Tokens stored in localStorage (có thể cải thiện bằng httpOnly cookies)
- Auto token refresh
- Protected routes
- Input validation

### Backend Integration
- JWT token validation
- Password hashing (bcrypt)
- Google OAuth integration
- Refresh token rotation

## Customization

### Thêm API endpoint mới
1. Thêm function vào `authService.js`
2. Tạo custom hook trong `useApi.js` nếu cần
3. Sử dụng trong component

### Thêm protected route mới
1. Wrap component với `<ProtectedRoute requireAuth={true}>`
2. Add route vào `App.js`

### Custom styling
- Đang sử dụng Tailwind CSS
- Có thể customize trong các component files
