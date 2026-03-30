import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
import admin from 'firebase-admin';
import path from 'path';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'haiders-mart-secret-node-01';

// --- Firebase Admin init (same as before) ---
if (!admin.apps.length) {
  let serviceAccount: any;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // For local development only (this file is ignored in production)
    const filePath = path.join(process.cwd(), 'haiders-mart-firebase-adminsdk-fbsvc-995d0f230e.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- Multer setup (still using local disk – see note later) ---
const uploadsDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// --- Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// --- Seed data (only if needed, but run once manually or in a separate script) ---
async function seedData() { /* ... same as your existing seedData ... */ }

// Call seedData on first run (optional)
// seedData().catch(console.error);

// --- All your API routes (copy exactly from your server.ts) ---
// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = [
    { id: 'admin-1', email: 'admin@haidersmart.pk', password: await bcrypt.hash('admin123', 10), role: 'admin', name: 'Haider Admin' },
    { id: 'admin-2', email: '1shahali121@gmail.com', password: await bcrypt.hash('#Admin313', 10), role: 'admin', name: 'Shah Ali Admin' },
  ];
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

app.post('/api/auth/admin-sync', (req, res) => {
  const { email } = req.body;
  if (email === '1shahali121@gmail.com') {
    const token = jwt.sign({ id: 'admin-google', email, role: 'admin', name: 'Admin (Google)' }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    return res.json({ success: true, user: { email, role: 'admin', name: 'Admin (Google)' } });
  }
  res.status(403).json({ error: 'Forbidden' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Upload routes
app.post('/api/admin/upload-image', authenticate, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

app.post('/api/admin/upload-glb', authenticate, isAdmin, upload.single('glb'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No GLB file uploaded' });
  const glbUrl = `/uploads/${req.file.filename}`;
  res.json({ glbUrl });
});

// Firestore routes (announcement, products, orders) – copy from your server.ts

// --- Export the app for Vercel ---
export default app;