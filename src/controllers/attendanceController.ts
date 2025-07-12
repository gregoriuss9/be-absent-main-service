import { Request, Response } from "express";
import { Attendance, User } from "../models";
import { ResponseUtil } from "../utils/responseUtil";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ValidationError } from "../utils/errorUtil";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Op } from "sequelize";
import { publishCheckInEvent } from "../utils/rabbitMq";
dayjs.extend(utc);
dayjs.extend(timezone);

export const checkIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const photoUrl = `/uploads/${req.file.filename}`;
    const today = dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");
    const findSubmitClockIn: any = await Attendance.findOne({
      where: {
        user_id: req.user.id,
        time_in: {
          [Op.gte]: dayjs(today).startOf("day").toDate(),
          [Op.lte]: dayjs(today).endOf("day").toDate(),
        },
      },
    });

    if (findSubmitClockIn) {
      throw new ValidationError("You have already clocked in today");
    }

    const attendance: any = await Attendance.create({
      user_id: req.user.id,
      time_in: new Date(),
      photo_url: photoUrl,
    });

    await publishCheckInEvent({
      user_id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      department: req.user.department,
      time_in: dayjs(attendance.time_in).tz("Asia/Jakarta").format(),
    });

    res
      .status(201)
      .json(ResponseUtil.success(attendance, "Check in successfull"));
  } catch (error) {
    console.error("Error checking in:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const checkOut = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    const attendance: any = await Attendance.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!attendance) {
      throw new ValidationError("Attendance not found");
    }

    if (attendance.time_out) {
      throw new ValidationError("Attendance already checked out");
    }

    attendance.time_out = new Date();

    await attendance.save();

    res
      .status(201)
      .json(ResponseUtil.success(attendance, "Check out successfull"));
  } catch (error) {
    console.error("Error checking out:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const isPresenceToday = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const today = dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");
    let isSubmitClockIn: boolean;
    let isSubmitClockOut: boolean;
    let idAttendance: number | null = null;
    const findSubmitClockIn: any = await Attendance.findOne({
      where: {
        user_id: req.user.id,
        time_in: {
          [Op.gte]: dayjs(today).startOf("day").toDate(),
          [Op.lte]: dayjs(today).endOf("day").toDate(),
        },
      },
    });
    const findSubmitClockOut: any = await Attendance.findOne({
      where: {
        user_id: req.user.id,
        time_out: {
          [Op.gte]: dayjs(today).startOf("day").toDate(),
          [Op.lte]: dayjs(today).endOf("day").toDate(),
        },
      },
    });

    if (findSubmitClockIn) {
      isSubmitClockIn = true;
      idAttendance = findSubmitClockIn.id;
    } else {
      isSubmitClockIn = false;
    }
    if (findSubmitClockOut) {
      isSubmitClockOut = true;
    } else {
      isSubmitClockOut = false;
    }

    res.status(200).json(
      ResponseUtil.success({
        isSubmitClockIn,
        isSubmitClockOut,
        idAttendance,
      })
    );
  } catch (error) {
    console.error("Error checking in:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const getOwnAttendances = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { rows, count } = await Attendance.findAndCountAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
      offset,
      limit,
    });

    res.status(200).json(
      ResponseUtil.success(rows, "Success fetch attendances on your account", {
        page,
        limit,
        totalPage: Math.ceil(count / limit),
        total: count,
      })
    );
  } catch (error) {
    console.error("Error fetching attendances:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const getAllAttendances = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Attendance.findAndCountAll({
      attributes: [
        "id",
        "user_id",
        "time_in",
        "time_out",
        "photo_url",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          attributes: ["no_employee", "name", "email", "department"],
        },
      ],
      order: [["created_at", "DESC"]],
      offset,
      limit,
    });

    const formattedHistories = rows.map((history: any) => ({
      id: history.id,
      user_id: history.user_id,
      time_in: history.time_in
        ? dayjs(history.time_in).tz("Asia/Jakarta").format()
        : null,
      time_out: history.time_out
        ? dayjs(history.time_out).tz("Asia/Jakarta").format()
        : null,
      photo_url: history.photo_url,
      created_at: history.created_at
        ? dayjs(history.created_at).tz("Asia/Jakarta").format()
        : null,
      updated_at: history.updated_at
        ? dayjs(history.updated_at).tz("Asia/Jakarta").format()
        : null,
      no_employee: history.User.no_employee,
      name: history.User.name,
      email: history.User.email,
      department: history.User.department,
    }));

    res.status(200).json(
      ResponseUtil.success(
        formattedHistories,
        "Success fetch all attendances",
        {
          page,
          limit,
          totalPage: Math.ceil(count / limit),
          total: count,
        }
      )
    );
  } catch (error) {
    console.error("Error fetching attendances:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};

export const getAttendancesToday = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const today = dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");
    const countOfEmployee = await User.count({ where: { deleted_at: null } });

    const countOfClockInToday = await Attendance.count({
      where: {
        time_in: {
          [Op.gte]: dayjs(today).startOf("day").toDate(),
          [Op.lte]: dayjs(today).endOf("day").toDate(),
        },
      },
    });

    const countOfClockOutToday = await Attendance.count({
      where: {
        time_out: {
          [Op.gte]: dayjs(today).startOf("day").toDate(),
          [Op.lte]: dayjs(today).endOf("day").toDate(),
        },
      },
    });

    const countOfNotYetClockInToday = countOfEmployee - countOfClockInToday;

    const countOfNotYetClockOutToday = countOfEmployee - countOfClockOutToday;

    res.status(200).json(
      ResponseUtil.success(
        {
          countOfEmployee,
          countOfClockInToday,
          countOfNotYetClockInToday,
          countOfClockOutToday,
          countOfNotYetClockOutToday,
        },
        "Success fetch all attendances"
      )
    );
  } catch (error) {
    console.error("Error fetching attendances:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json(ResponseUtil.error("Internal server error"));
  }
};
