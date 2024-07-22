import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;
const OPENAI_KEY = process.env.OPENAI_API_KEY

export { PORT, OPENAI_KEY };