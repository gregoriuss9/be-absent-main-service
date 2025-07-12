import dotenv from "dotenv";

dotenv.config();

const development = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: "mysql",
  timezone: "+07:00",
  logging: true,
};

export default {
  development,
};
