import express, { type Request, type Response } from "express";
import { config } from "./envConfig.ts";
import { pool } from "./config/railway.ts";
import cors from 'cors';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Server's running");
});

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to Railway MySQL database!");
    connection.release(); // Release the connection back to the pool
    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
      console.log(`-----------------------------------`);
    });
  } catch (error) {
    console.error(" Failed to connect to the database:", error);
    process.exit(1); // Exit process with failure code
  }
};

startServer();
