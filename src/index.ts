import express from "express";
import configDotenv from "dotenv";
import webhookRouter from "./routes/route";
import cors from "cors";

configDotenv.config();

const app = express();

const BANK_URL = process.env.BANK_URL || "http://localhost:4000";

app.use(
  cors({
    origin: [BANK_URL],
  })
);
app.use(express.json());

app.use("/api/v1", webhookRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
