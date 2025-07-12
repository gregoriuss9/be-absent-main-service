import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import V1Router from "./routes";
import sequelize from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";
import { initRabbitMQ } from "./utils/rabbitMq";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/v1/main", V1Router);

app.use(errorHandler);

try {
  async function bootstrap() {
    await sequelize.authenticate();
    console.log("Database connected");
    await initRabbitMQ();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
  bootstrap();
} catch (error) {
  console.error("Error connecting to the database:", error);
}
