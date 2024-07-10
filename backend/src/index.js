import app from "./app/app.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 8080;
const OPENAI_KEY = process.env.OPENAI_API_KEY


app.listen(PORT);


export { OPENAI_KEY };