import express from 'express';
import { 
    getDevices,
    connectDevice,
    disconnectDevice,
    updateDeviceStatus
} from '../controllers/device.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getDevices);
router.post('/', verifyToken, connectDevice);
router.delete('/:device_id', verifyToken, disconnectDevice);
router.patch('/:device_id/status', verifyToken, updateDeviceStatus);

export default router;
