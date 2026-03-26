import 'dotenv/config'; // Đảm bảo Node đọc được file .env
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Lấy nguyên cái chuỗi URL từ file .env 
const connectionString = process.env.DATABASE_URL;

// 2. Khởi tạo Pool kết nối
const pool = new Pool({ connectionString });

// 3. Khởi tạo Adapter
const adapter = new PrismaPg(pool);

// 4. Nhét Adapter vào PrismaClient 
const prisma = new PrismaClient({ adapter });

export default prisma;