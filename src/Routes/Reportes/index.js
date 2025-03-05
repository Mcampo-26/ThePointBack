import express from "express";
import { getTopProductos } from "../../controllers/reportesControllers/index.js";

const router = express.Router();

router.get("/top-productos", getTopProductos);

export default router;
