import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    no_employee: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("employee", "hrd"),
      defaultValue: "employee",
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    department: {
      type: DataTypes.ENUM(
        "engineer",
        "human resource",
        "finance",
        "general affair"
      ),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export default User;
