// import dotenv from "dotenv"
// --------------------------------
import * as dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '../.env')
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