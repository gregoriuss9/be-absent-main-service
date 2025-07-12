import { Router } from "express";
import {
  checkIn,
  checkOut,
  isPresenceToday,
  getOwnAttendances,
  getAllAttendances,
  getAttendancesToday,
} from "../controllers/attendanceController";
import { authenticate, isHrd } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

router.post("/check-in", upload.single("photo"), authenticate, checkIn);
router.post("/check-out/:id", authenticate, checkOut);
router.get("/presence-today", authenticate, isPresenceToday);
router.get("/own", authenticate, getOwnAttendances);
router.get("/", authenticate, isHrd, getAllAttendances);
router.get("/employees-today", authenticate, isHrd, getAttendancesToday);

export default router;
