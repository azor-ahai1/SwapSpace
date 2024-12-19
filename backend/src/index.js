import * as dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add more robust dotenv configuration
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

connectDB().then(
    () => {
        const port = process.env.PORT || 8000;
        app.listen(port, () =>{
            console.log(`Server is running on port ${port}`);
        })
    }
).catch((err) => {
    console.error("MONGO DB Connection failed in src/index.js ", err)
})