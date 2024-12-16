import { Router } from "express";
import { placeOrder, cancelOrder } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/place-order").post(verifyJWT, placeOrder);
router.route("/cancel-order").post(verifyJWT, cancelOrder);

export default router;