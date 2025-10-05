import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_EXPIRY = '7d';

function signJwt(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

export async function signup(req, res) {
  try {
    const { name, email, password, role, teamName } = req.body;

    // eslint-disable-next-line no-console
    console.log('Signup payload:', { name, email, role, teamName });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'team',
      teamName: teamName || '',
    });

    // eslint-disable-next-line no-console
    console.log('User created with id:', user._id.toString());

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamName: user.teamName,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    // eslint-disable-next-line no-console
    console.log('Login attempt for:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signJwt({ userId: user._id, role: user.role });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamName: user.teamName,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

export default { signup, login };

