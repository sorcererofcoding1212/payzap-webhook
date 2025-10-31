import { Router } from "express";
import { catchTransaction } from "../controllers/controller";

const route = Router();

route.post("/bank-webhook", catchTransaction);

export default route;
