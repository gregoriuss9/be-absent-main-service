import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "../utils/responseUtil";
import { AuthenticationError } from "../utils/errorUtil";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthenticationError("No token provided");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AuthenticationError("Invalid or expired token");
  }
};

export const isHrd = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any => {
  if (req.user.role !== "hrd") {
    return res.status(403).json(ResponseUtil.unauthorized("Access denied"));
  }
  next();
};
