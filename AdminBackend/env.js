import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("DEBUG: env.js - dotenv loading:", result.error ? "FAILED" : "SUCCESS");
console.log("DEBUG: env.js - .env path used:", path.resolve(__dirname, ".env"));
console.log("DEBUG: env.js - JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");
