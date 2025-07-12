import User from "../models/user";
import bcrypt from "bcrypt";
import { ResponseUtil } from "../utils/responseUtil";
import { ValidationError } from "../utils/errorUtil";
import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import { format } from "path";

const generateEmployeeNo = async (): Promise<string> => {
  const now = new Date();
  //format to YYYYMMDD
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const yearMonthDay = `${year}${month}${day}`;

  // check latest no employee in Users table
  const latest: any = await User.findOne({
    order: [["no_employee", "DESC"]],
    where: {
      no_employee: {
        [Op.startsWith]: yearMonthDay,
      },
    },
  });

  let nextSequence = 1;
  if (latest?.no_employee) {
    const lastSequence = latest.no_employee.slice(-4); // Get the last 4 characters
    nextSequence = parseInt(lastSequence, 10) + 1;
  }
  const sequenceStr = String(nextSequence).padStart(4, "0");
  return `${year}${month}${day}${sequenceStr}`;
};

const departmentList = [
  "engineer",
  "human resource",
  "finance",
  "general affair",
];

export const getAllEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = (req.query.search as string) || "";
    const department = (req.query.department as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    // filter by search key
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { no_employee: { [Op.like]: `%${search}%` } },
      ];
    }

    // filter by department
    if (department) {
      where.department = department;
    }
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ["id", "no_employee", "name", "email", "department"],
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(
      ResponseUtil.success(rows, "Success fetch all employee", {
        page,
        limit,
        totalPage: Math.ceil(count / limit),
        total: count,
      })
    );
  } catch (error) {
    console.error("Error fetching employees:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const getAllDepartment = async (_req: Request, res: Response) => {
  try {
    const departments = await User.findAll({
      attributes: ["department"],
      group: ["department"],
    });

    const formattedDepartments = departments.map((department: any) => {
      return {
        value: department.dataValues.department,
        label: department.dataValues.department
          .split(" ")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      };
    });

    res.status(200).json(ResponseUtil.success(formattedDepartments));
  } catch (error) {
    console.error("Error fetching departments:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const createSingleEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, name, role, email, department } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const maxRetries = 5;
    let attempt = 0;
    let lastError: any;
    let user: any;

    if (!departmentList.includes(department)) {
      throw new ValidationError("Invalid department");
    }
    while (attempt < maxRetries) {
      try {
        const employeeNo = await generateEmployeeNo();
        user = await User.create({
          username,
          password_hash: hashedPassword,
          name,
          no_employee: employeeNo,
          role,
          email,
          department,
        });
        break;
      } catch (error: any) {
        attempt++;
        lastError = error;
        console.warn(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt >= maxRetries) {
          break;
        }
      }
    }
    if (!user) {
      throw lastError ?? new Error("Failed to create user");
    }

    res
      .status(201)
      .json(ResponseUtil.success(user, "User created successfully"));
  } catch (error) {
    console.error("Error on register:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id;
  try {
    const employee = await User.findOne({
      where: {
        id,
        deleted_at: null,
      },
      attributes: [
        "id",
        "no_employee",
        "name",
        "username",
        "email",
        "department",
      ],
    });

    res.status(200).json(ResponseUtil.success(employee));
  } catch (error) {
    console.error("Error fetching employee with ID: ", id, error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const updateEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id;
  try {
    const { name, email, department } = req.body;

    const employeeExist = await User.findOne({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!employeeExist) {
      throw new ValidationError("Employee not found");
    }

    await User.update({ name, email, department }, { where: { id } });

    res.status(200).json(ResponseUtil.success(null, "Employee updated"));
  } catch (error) {
    console.error("Error updating employee with ID: ", id, error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const employeeExist = await User.findOne({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!employeeExist) {
      throw new ValidationError("Employee not found");
    }

    await User.update({ deleted_at: new Date() }, { where: { id } });

    res.status(200).json(ResponseUtil.success(null, "Employee deleted"));
  } catch (error) {
    console.error("Error deleting employee with ID: ", id, error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};
