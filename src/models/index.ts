import sequelize from "../config/db";
import User from "./user";
import Attendance from "./attendance";

// Setup associations
User.hasMany(Attendance, { foreignKey: "user_id" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

// Export all models and sequelize instance
export { sequelize, User, Attendance };
