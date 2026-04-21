import { Router } from 'express';
import { getRoomDetail, listRooms } from '../controllers/room.controller.js';

const router = Router();

router.get('/', listRooms);
router.get('/:id', getRoomDetail);

export default router;
