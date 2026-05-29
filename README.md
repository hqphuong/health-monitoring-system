# HealthGuard - Hệ Thống Theo Dõi Sức Khỏe & Cảnh Báo SOS

HealthGuard là đồ án đa ngành hướng Công nghệ phần mềm. Hệ thống cung cấp giải pháp toàn diện để thu thập dữ liệu sinh trắc học (nhịp tim, huyết áp, bước chân, giấc ngủ...) từ thiết bị đeo thông qua Google Health Connect. Dữ liệu được xử lý liên tục để phân tích rủi ro y tế và tự động kích hoạt mạng lưới gọi điện cấp cứu (SOS) cho người thân trong tình huống nguy hiểm.

## Liên Kết Quan Trọng (Demo & Cài đặt)
* **Thư mục lưu trữ (Bao gồm Video Demo & File cài đặt .apk):** [Truy cập tại Google Drive](https://drive.google.com/drive/folders/1jkrzH6nKyrrWNxv-QR9cO9omz5XhBn_d?usp=sharing)

## Cấu trúc Thư mục
* `/mobile-app`: Mã nguồn ứng dụng di động.
* `/backend-server`: Mã nguồn máy chủ xử lý logic và API.
* `/ai-service`: Mô hình phân tích dữ liệu.
* `/database`: Chứa script SQL khởi tạo bảng.
```text
backend-server/
├── prisma/
│   └── schema.prisma           # Chứa cấu trúc Database
├── src/
│   ├── controllers/            # Nơi chứa logic xử lý (Trái tim của hệ thống)
│   │   ├── auth.controller.js
│   │   ├── profile.controller.js
│   │   ├── relative.controller.js
│   │   ├── device.controller.js
│   │   └── internal.controller.js
│   ├── routes/                 # Nơi định nghĩa URL (Bản đồ dẫn đường)
│   │   ├── auth.routes.js      # Tương đương folder "Auth" trên Postman
│   │   ├── profile.routes.js   # Tương đương folder "Health Profile"
│   │   ├── relative.routes.js  # Tương đương folder "Relatives"
│   │   ├── device.routes.js    # Tương đương folder "Devices"
│   │   ├── internal.routes.js  # Tương đương folder "Internal Alerts"
│   │   └── index.js            # File gom tất cả các route lại
│   ├── middlewares/            # Nơi chứa bảo vệ (Cổng an ninh)
│   │   ├── auth.middleware.js  # Kiểm tra JWT Token
│   │   └── internal.middleware.js # Kiểm tra x-internal-secret
│   └── server.js               # File gốc khởi chạy toàn bộ server Node.js
├── .env                        # Chứa biến môi trường (Database URL, Secret Key)
└── package.json
```
## Tech Stack (Công Nghệ Sử Dụng)
* **Frontend:** React Native (Expo) - Thiết kế UI/UX, tích hợp biểu đồ động và OS Deep Linking (Native Calling).
* **Backend:** Node.js (Express.js) - RESTful API, quản lý phiên bản, Real-time Socket.io.
* **Database:** PostgreSQL quản lý và truy vấn thông qua Prisma ORM.
* **AI Service:** Python - Xây dựng mô hình phân tích chỉ số và cảnh báo xu hướng.
* **Tài liệu API:** Swagger UI (OpenAPI).

---

## Cấu Trúc Thư Mục
* `/mobile-app`: Mã nguồn ứng dụng di động (Giao diện, xử lý Health Connect, hiển thị Dashboard).
* `/backend-server`: Hệ thống máy chủ xử lý logic cốt lõi, phân quyền JWT, xử lý Bulk Insert và điều phối tín hiệu SOS.
* `/ai-service`: Mã nguồn các mô hình phân tích và đánh giá rủi ro sức khỏe bằng Python.
* `/database`: Các kịch bản SQL và cấu hình Prisma Schema (schema.prisma).

---

## Hướng Dẫn Cài Đặt Và Chạy Cục Bộ (Local Development)

### 1. Yêu cầu hệ thống (Prerequisites)
* Node.js (Phiên bản v18 trở lên)
* PostgreSQL (Hoặc sử dụng dịch vụ Cloud Database như Neon)
* Expo CLI (Cài đặt toàn cầu qua lệnh: `npm install -g expo-cli`)
* Python 3.8+ (Dành cho phân hệ AI)
* Điện thoại thật đã cài đặt ứng dụng Expo Go để chạy thử giao diện.

### 2. Khởi chạy Backend Server
Mở một cửa sổ Terminal mới và di chuyển vào thư mục máy chủ:
```bash
cd backend-server

# Cài đặt các gói phụ thuộc
npm install
```

Cấu hình biến môi trường bằng cách tạo một file `.env` nằm ở thư mục gốc của `backend-server` và điền các thông số bảo mật:
```env
DATABASE_URL="postgresql://user:pass@host/mydb?sslmode=require"
JWT_SECRET="ChuoiBiMatCuaBan"
EMAIL_USER="your_email@gmail.com" 
EMAIL_PASSWORD="your_app_password"
```

Đồng bộ Schema thiết kế với cơ sở dữ liệu và khởi động server:
```bash
# Đồng bộ Schema với Database
npx prisma db push

# Khởi động server
npm run dev
```
* Mặc định server chạy tại: `http://localhost:3000`
* Tài liệu API (Swagger) cục bộ: `http://localhost:3000/api-docs`
* Tài liệu API (Swagger) Production: `https://healthguard-api-42q2.onrender.com/api-docs`

### 3. Khởi chạy Mobile App (Frontend)
Mở một cửa sổ Terminal độc lập khác và chuyển hướng vào thư mục mã nguồn ứng dụng di động:
```bash
cd mobile-app

# Cài đặt các thư viện Frontend
npm install
```

Khởi động Expo bundler hệ thống:
```bash
npx expo start
```
* Hệ thống sẽ hiển thị một mã QR lớn trên Terminal.
* Đảm bảo máy tính và điện thoại của bạn đang kết nối chung một mạng Wi-Fi nội bộ.
* Mở ứng dụng Expo Go trên thiết bị di động, quét mã QR này để tải giao diện ứng dụng và bắt đầu trải nghiệm.

---

Run
node src/server.js
