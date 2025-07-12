import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Attendance = sequelize.define(
  "Attendance",
  {
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    time_in: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "attendance_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Attendance;
