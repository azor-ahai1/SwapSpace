import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

import path from "path";
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


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

// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === "production") {
//     // const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
//     // app.use(express.static(frontendDistPath));
//     // // app.use(express.static(path.join(__dirname, "client", "frontend", "dist"))); 
//     // app.get("*", (req, res) => {
//     //     res.sendFile(path.join(frontendDistPath, "index.html")); 
//     // });
//     app.use(express.static(path.join(__dirname, '../frontend/dist')));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
//     });
// }
app.use(express.static('/opt/render/project/src/frontend/dist'));

app.get('*', (req, res) => {
    res.sendFile(path.join('/opt/render/project/src/frontend/dist', 'index.html'));
});

//---------------------------------------------------------------------------------

export {app}