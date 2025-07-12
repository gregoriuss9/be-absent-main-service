import { Router } from "express";
import {
  getAllEmployees,
  createSingleEmployee,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
  getAllDepartment,
} from "../controllers/employeeController";
import { authenticate, isHrd } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, getAllEmployees);
router.get("/department", authenticate, getAllDepartment);
router.post("/", authenticate, isHrd, createSingleEmployee);
router.get("/:id", authenticate, isHrd, getEmployeeById);
router.put("/:id", authenticate, isHrd, updateEmployee);
router.delete("/:id", authenticate, isHrd, deleteEmployee);

export default router;
