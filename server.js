import { PrismaClient } from "@prisma/client";
import express from "express"
import dotenv from "dotenv"
import prisma from "./db/db.config.js";
import loginRoutes from './routes/login.routes.js';
import signupRoutes from './routes/signup.routes.js';


dotenv.config();
const app = express()
const PORT = process.env.PORT || 5000
app.use(express.json())


app.use("/api", loginRoutes);

app.use("/api", signupRoutes);

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})