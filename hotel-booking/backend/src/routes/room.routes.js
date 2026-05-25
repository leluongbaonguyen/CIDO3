import { Router } from 'express';
import { getRoomDetail, listRooms, getRoomTypes, getAmenities } from '../controllers/room.controller.js';

const router = Router();

router.get('/', listRooms);
router.get('/types', getRoomTypes);
router.get('/amenities', getAmenities);
router.get('/:id', getRoomDetail);

export default router;
