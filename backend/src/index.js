import dotenv from "dotenv"
// --------------------------------
import path from "path"

dotenv.config({
    path: path.resolve(process.cwd(), '.env')
})

// -------------------------------


import connectDB from "./db/index.js";
import { app } from "./app.js";


// dotenv.config({
//     path: "./.env"
// })

connectDB().then(
    () => {
        app.listen(process.env.PORT || 8000, () =>{
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        })
    }
).catch((err) => {
    console.log("MONGO DB Connection failed in src/index.js ", err)
})