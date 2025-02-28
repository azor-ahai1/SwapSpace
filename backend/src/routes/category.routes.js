import { Router } from "express";
import { getAllCategories } from "../controllers/category.controller.js";


const router = Router();

router.route("/getallcategories").get(getAllCategories);

export default router;