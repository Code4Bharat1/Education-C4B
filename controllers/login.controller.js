import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'; 
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();
const JWT_SECRET = 'your-secret-key';

export const loginUser = async (req, res) => {
  // Log incoming data for debugging
  console.log('Login request body:', req.body);

  // Validate input (if using express-validator)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Unique ID and password are required.' });
  }

  try {
    let user;

    if (email.includes('@')) {
      // Treat as email
      user = await prisma.user.findUnique({ where: { email: email } });
    } else {
      // Treat as UUID string user ID
      user = await prisma.user.findUnique({ where: { id: email } });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid unique ID or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid unique ID or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
