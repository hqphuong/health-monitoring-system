import express from 'express';
import apiRoutes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';

const app = express();
app.use(express.json()); // Đọc được JSON từ Body Postman

app.use('/api/v1', apiRoutes);

const PORT = process.env.PORT || 3000;
setupSwagger(app);
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});