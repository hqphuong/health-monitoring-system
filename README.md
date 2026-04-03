# Hệ Thống Theo Dõi Sức Khỏe

Đồ án đa ngành hướng Công nghệ phần mềm. Hệ thống thu thập dữ liệu nhịp tim, huyết áp, bước chân,... từ thiết bị đeo tay thông qua Health Connect, phân tích rủi ro bằng AI và phát tín hiệu cấp cứu SOS.

## Tech Stack
* **Frontend:** React Native / Expo
* **Backend:** Node.js (Express) & Prisma ORM
* **Database:** PostgreSQL
* **AI Service:** Python

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
## Đội ngũ Phát triển


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
