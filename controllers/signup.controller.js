import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Admin creates a new user (FSD or ITS)
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔍 Log incoming request for debugging
    console.log("Signup request body:", { name, email, password: !!password, role });

    // ✅ Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required: name, email, password, role"
      });
    }

    // ✅ Validate password string
    if (typeof password !== "string" || password.trim().length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // ✅ Validate role
    const validRoles = ["FSD", "ITS", "Admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`
      });
    }

    // 🔐 Optional: Restrict signup to Admins only
    /*
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "Admin") {
      return res.status(403).json({ message: "Only Admins can create accounts" });
    }
    */

    // ✅ Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // ✅ Return success (exclude sensitive fields)
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
