import express from "express";
import configDotenv from "dotenv";
import webhookRouter from "./routes/route";
import cors from "cors";

configDotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", webhookRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
