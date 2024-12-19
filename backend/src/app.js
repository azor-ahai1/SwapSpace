import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

import path from "path";


const app = express()

// --------------------------------------------------------------------------

app.use(cors({
    // origin: 'http://localhost:5173', 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));


app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

// ----------------------------------------------------------------------------

import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter from "./routes/category.routes.js"
import orderRouter from "./routes/order.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/categories", categoryRouter)
app.use("/api/v1/orders", orderRouter)

//---------------------------------------------------------------------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "client", "frontend", "dist"))); 
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname1, "client", "frontend", "dist", "index.html")); 
    });
}

//---------------------------------------------------------------------------------

export {app}