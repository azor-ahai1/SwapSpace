<<<<<<< HEAD
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
=======
// import dotenv from "dotenv"
// import connectDB from "./db/index.js";
// import { app } from "./app.js";
>>>>>>> cd1684f735f3d876d36caf3158c053106daaa24d

// // --------------------------------
// import path from "path"

// dotenv.config({
//     path: path.resolve(process.cwd(), '.env')
// })

// // -------------------------------

// // dotenv.config({
// //     path: "./.env"
// // })

// connectDB().then(
//     () => {
//         app.listen(process.env.PORT || 8000, () =>{
//             console.log(`Server is running on port ${process.env.PORT || 8000}`);
//         })
//     }
// ).catch((err) => {
//     console.log("MONGO DB Connection failed in src/index.js ", err)
// })




import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed in src/index.js", err);
  });
