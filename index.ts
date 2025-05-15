import express from "express";
import { connectDB } from "./libs/db";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import habitsRouter from "./routes/habits";
import job from "./libs/cron";
import { connectRedis } from "./libs/redis";

dotenv.config();


const app = express();
const port = process.env.PORT;
// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

// middlewares
app.use(cors());
app.use(express.json());
// app.use(limiter);

// swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// routes
app.use("/api/habits", habitsRouter);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
    job.start();
    connectRedis();
});