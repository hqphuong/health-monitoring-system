# Docker Compose Setup Guide

Hướng dẫn chạy Health Monitoring System Backend với Docker Compose.

## 📋 Yêu cầu

- Docker (phiên bản 20.10+)
- Docker Compose (phiên bản 2.0+)
- Neon PostgreSQL account (hoặc database PostgreSQL khác)

## 🚀 Khởi động

### 1. Cấu hình Environment Variables

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
nano .env
```

**Các biến quan trọng:**
- `DATABASE_URL`: PostgreSQL connection string từ Neon
- `JWT_SECRET`: Secret key cho JWT tokens (giữ bí mật!)
- `EMAIL_USER` & `EMAIL_PASS`: Gmail SMTP credentials
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials

### 2. Build và chạy containers

```bash
# Build images (lần đầu tiên)
docker-compose build

# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│         Docker Network (health-network)         │
│                                                 │
│  ┌────────────────────┐                         │
│  │  Backend API       │ (port 3000)             │
│  │  (health-api)      │◄─────────┐              │
│  └────────────────────┘          │              │
│           │                      │              │
│           │          ┌───────────┴────────┐     │
│           │          │                    │     │
│           ▼          ▼                    │     │
│        Redis      Neon PostgreSQL    Socket.IO  │
│      (in Docker)   (Cloud)           (connections)
│
│  http://localhost:3000/api/v1
└─────────────────────────────────────────────────┘
```

## 🔗 Services

| Service | Type | Port | Mục đích |
|---------|------|------|---------|
| **backend** | Docker | 3000 | API Server |
| **redis** | Docker | 6379 | Cache & Job Queue (BullMQ) |
| **PostgreSQL** | Cloud (Neon) | Remote | Database |

## 🛠️ Các lệnh hữu ích

```bash
# Khởi động lại services
docker-compose restart

# Tắt tất cả containers (giữ data)
docker-compose down

# Tắt và xóa volumes
docker-compose down -v

# Xem trạng thái các services
docker-compose ps

# Chạy lệnh trong container
docker-compose exec backend npm run dev
docker-compose exec redis redis-cli

# Xem CPU/Memory usage
docker stats

# Xem logs từ thời điểm nhất định
docker-compose logs --since 10m backend

# Theo dõi logs real-time với timestamp
docker-compose logs -f --timestamps backend
```

## 🔍 Health Checks

```bash
# Kiểm tra Redis
docker-compose exec redis redis-cli ping

# Kiểm tra Backend API
curl http://localhost:3000/api/v1

# Xem trạng thái services
docker-compose ps
```

## 🗄️ Database Management

### Kết nối tới Neon PostgreSQL

```bash
# Từ terminal (cần psql client)
psql "postgresql://neondb_owner:password@your_neon_host/neondb?sslmode=require"
```

### Prisma Commands

```bash
# Generate Prisma Client (tự động chạy khi docker build)
docker-compose exec backend npm run postinstall

# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Xem database schema
docker-compose exec backend npx prisma studio
```

## 🐛 Troubleshooting

### Backend không kết nối được Database

1. Kiểm tra DATABASE_URL trong .env:
   ```bash
   docker-compose exec backend env | grep DATABASE_URL
   ```

2. Test kết nối PostgreSQL:
   ```bash
   docker-compose exec backend npx prisma db execute --stdin < query.sql
   ```

3. Kiểm tra logs:
   ```bash
   docker-compose logs backend | grep -i error
   docker-compose logs backend | grep -i database
   ```

### Port đã được dùng

```bash
# Thay đổi PORT trong .env
PORT=3001

# Restart services
docker-compose restart
```

### Redis connection refused

```bash
# Restart Redis
docker-compose restart redis

# Kiểm tra Redis status
docker-compose exec redis redis-cli ping
```

### Build lại từ đầu

```bash
# Tắt tất cả
docker-compose down

# Xóa volumes (nếu cần)
docker volume rm health-monitoring-system_redis_data

# Build lại
docker-compose build --no-cache

# Khởi động
docker-compose up -d
```

### Logs ngập ngụa "Connection refused"

Đảm bảo .env có đầy đủ các biến:
```bash
cat .env | grep -E "DATABASE_URL|PORT|JWT_SECRET"
```

## 📝 File Structure

```
health-monitoring-system/
├── .env                           # Environment variables (local)
├── .env.example                   # Template (commit to git)
├── docker-compose.yml             # Docker Compose config
├── DOCKER_COMPOSE_GUIDE.md        # Hướng dẫn này
├── backend-server/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── server.js             # Main entry point (port từ .env)
│   │   └── ...
│   └── prisma/
│       └── schema.prisma          # Database schema
└── ...
```

## 📈 Production Considerations

1. **Bảo mật DATABASE_URL**: 
   - Không commit .env vào git
   - Sử dụng `.env.example` cho template
   - Rotate passwords định kỳ

2. **JWT Secret**:
   - Tạo một secret dài, ngẫu nhiên
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Resource Limits** (thêm vào docker-compose.yml):
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```

4. **Backups**: 
   - Backup Neon database thường xuyên
   - Kiểm tra Neon dashboard cho backup options

5. **Monitoring**:
   - Sử dụng Docker logs
   - Cấu hình centralized logging nếu cần

## ✅ Checklist Trước Deploy

- [ ] DATABASE_URL có trong .env?
- [ ] JWT_SECRET được set với giá trị mạnh?
- [ ] Neon database đã connect thành công?
- [ ] Redis container chạy?
- [ ] API endpoint `http://localhost:3000/api/v1` accessible?
- [ ] Prisma migrations đã chạy?
- [ ] Logs không có errors?

## 📞 Support

Để xem thêm:
- `README.md` - Tổng quan project
- `backend-server/package.json` - Dependencies
- `backend-server/prisma/schema.prisma` - Database schema
