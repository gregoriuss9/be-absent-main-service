import { Router } from "express";
import AttendanceRouter from "./attendanceRoutes";
import EmployeeRouter from "./employeeRoutes";

const V1Router = Router();

V1Router.use("/employees", EmployeeRouter);
V1Router.use("/attendances", AttendanceRouter);

export default V1Router;
