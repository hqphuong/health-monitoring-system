# HealthGuard - Hệ Thống Theo Dõi Sức Khỏe & Cảnh Báo SOS

HealthGuard là đồ án đa ngành hướng Công nghệ phần mềm. Hệ thống cung cấp giải pháp toàn diện để thu thập dữ liệu sinh trắc học (nhịp tim, huyết áp, bước chân, giấc ngủ...) từ thiết bị đeo thông qua Google Health Connect. Dữ liệu được xử lý liên tục để phân tích rủi ro y tế và tự động kích hoạt mạng lưới gọi điện cấp cứu (SOS) cho người thân trong tình huống nguy hiểm.

## Liên Kết Quan Trọng (Demo & Cài đặt)
* **Thư mục lưu trữ (Bao gồm Video Demo & File cài đặt .apk):** [Truy cập tại Google Drive](https://drive.google.com/drive/folders/1jkrzH6nKyrrWNxv-QR9cO9omz5XhBn_d?usp=sharing)

## Cấu trúc Thư mục
* `/mobile-app`: Mã nguồn ứng dụng di động.
* `/backend-server`: Mã nguồn máy chủ xử lý logic và API.
* `/ai-service`: Mô hình phân tích dữ liệu.
* `/database`: Chứa script SQL khởi tạo bảng.
'''
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
'''
## Note

Set up neon
npx neonctl@latest init

npx prisma generate

nạp cấu trúc file schema.prisma xuống Database

npx prisma db push

view data 
npx prisma studio

Run
node src/server.js
