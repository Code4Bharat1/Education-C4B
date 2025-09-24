import { PrismaClient } from "@prisma/client";
import express from "express"
import dotenv from "dotenv"
import prisma from "./db/db.config.js";

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})