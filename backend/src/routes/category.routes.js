// src/routes/category.routes.js
import { Router } from "express";
import { getAllCategories } from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getallcategories").get(getAllCategories);

export default router;