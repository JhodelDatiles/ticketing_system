import express, { type Request, type Response } from "express";
import { config } from "./envConfig.ts";
import { pool } from "./config/railway.ts";
import cors from 'cors';
import authRoutes from "./routes/AuthRoutes.ts";
import ticketRoutes from "./routes/TicketRoutes.ts";
import commentRoutes from "./routes/CommentRoutes.ts";
import attachmentRoutes from "./routes/AttachmentRoutes.ts";
import categoryRoutes from "./routes/CategoryRoutes.ts";
import priorityRoutes from "./routes/PriorityRoutes.ts";
import statusRoutes from "./routes/StatusRoutes.ts";
import userRoutes from "./routes/UserRoutes.ts";
import reportRoutes from "./routes/ReportRoutes.ts";

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Server's running");
});

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/comments", commentRoutes);
app.use("/attachments", attachmentRoutes);
app.use("/categories", categoryRoutes);
app.use("/priorities", priorityRoutes);
app.use("/statuses", statusRoutes);
app.use("/users", userRoutes);
app.use("/reports", reportRoutes);

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