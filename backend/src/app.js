// import express from "express";
// import cors from "cors"
// import cookieParser from "cookie-parser"

// import path from "path";
// // import { fileURLToPath } from 'url';

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);


// const app = express()

// // --------------------------------------------------------------------------

// //MY CHANGES --- UTKARSH
// app.use(cors({
//     // origin: 'http://localhost:5173', 
//     origin: process.env.CORS_ORIGIN, 
//     origin: (origin, callback) => {
//       callback(null, true); // Allow all origins dynamically
//     },
//     // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
//     credentials: true
//   }));


// app.use(express.json({
//     limit: "16kb"
// }))

// app.use(express.urlencoded({
//     extended: true,
//     limit: "16kb"
// }))

// app.use(express.static("public"))

// app.use(cookieParser())

// // app.js
// app.use((err, req, res, next) => {
//     console.error('Global Error Middleware:', {
//       timestamp: new Date().toISOString(),
//       method: req.method,
//       path: req.path,
//       body: req.body,
//       query: req.query,
//       error: {
//         message: err.message,
//         stack: err.stack,
//         name: err.name,
//         code: err.code
//       }
//     });
  
//     res.status(500).json({
//       success: false,
//       message: err.message || 'Internal Server Error',
//       ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//     });
//   });

// // ----------------------------------------------------------------------------

// import userRouter from "./routes/user.routes.js"
// import productRouter from "./routes/product.routes.js"
// import categoryRouter from "./routes/category.routes.js"
// import orderRouter from "./routes/order.routes.js"

// app.use("/api/v1/users", userRouter)
// app.use("/api/v1/products", productRouter)
// app.use("/api/v1/categories", categoryRouter)
// app.use("/api/v1/orders", orderRouter)

// //---------------------------------------------------------------------------------

// // const __dirname1 = path.resolve();
// // if (process.env.NODE_ENV === "production") {
// //     // const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
// //     // app.use(express.static(frontendDistPath));
// //     // // app.use(express.static(path.join(__dirname, "client", "frontend", "dist"))); 
// //     // app.get("*", (req, res) => {
// //     //     res.sendFile(path.join(frontendDistPath, "index.html")); 
// //     // });
// //     app.use(express.static(path.join(__dirname, '../frontend/dist')));
// //     app.get('*', (req, res) => {
// //         res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// //     });
// // }
// // app.use(express.static('/opt/render/frontend/dist'));

// // app.get('*', (req, res) => {
// //     res.sendFile(path.join(process.cwd(), 'frontend', 'dist', 'index.html'));
// // });

// app.use((req, res, next) => {
//   console.log('Request Origin:', req.headers.origin);  // Log origin for debugging
//   res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN); // Set header dynamically
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });

// // app.options('*', cors()); 

// //---------------------------------------------------------------------------------

// export {app}







import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Allow frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Origin",
      "X-Requested-With",
      "Accept",
      "x-client-key",
      "x-client-token",
      "x-client-secret",
      "Authorization",
    ],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(cookieParser());

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error("Global Error Middleware:", {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
    },
  });

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Routes
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js";
import orderRouter from "./routes/order.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/orders", orderRouter);

// Catch-all for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

export { app };
