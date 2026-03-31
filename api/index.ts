import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { put } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'haiders-mart-secret-node-01';

// --- Firebase Admin init ---
if (!admin.apps.length) {
  let serviceAccount: any;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local fallback (only during development)
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

// --- Multer setup (memory storage) ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Auth middleware ---
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

// --- Hardcoded admin users ---
let users = [
  { id: 'admin-1', email: 'admin@haidersmart.pk', password: bcrypt.hashSync('admin123', 10), role: 'admin', name: 'Haider Admin' },
  { id: 'admin-2', email: '1shahali121@gmail.com', password: bcrypt.hashSync('#Admin313', 10), role: 'admin', name: 'Shah Ali Admin' },
];

// --- Auth routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
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

// --- Upload routes (Vercel Blob) ---
app.post('/api/admin/upload-image', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const blob = await put(req.file.originalname, req.file.buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  res.json({ imageUrl: blob.url });
});

app.post('/api/admin/upload-glb', authenticate, isAdmin, upload.single('glb'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No GLB file uploaded' });
  const blob = await put(req.file.originalname, req.file.buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  res.json({ glbUrl: blob.url });
});

// --- Firestore routes ---
app.get('/api/announcement', async (req, res) => {
  const doc = await db.collection('announcement').doc('current').get();
  res.json(doc.exists ? doc.data() : { text: '', isActive: false, link: '#', color: 'cyan' });
});

app.post('/api/admin/announcement', authenticate, isAdmin, async (req, res) => {
  await db.collection('announcement').doc('current').set(req.body, { merge: true });
  const updated = await db.collection('announcement').doc('current').get();
  res.json(updated.data());
});

app.get('/api/products', async (req, res) => {
  const snapshot = await db.collection('products').get();
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(products);
});

app.post('/api/admin/products', authenticate, isAdmin, async (req, res) => {
  const newProduct = { ...req.body, rating: req.body.rating || 5.0 };
  const docRef = await db.collection('products').add(newProduct);
  res.status(201).json({ id: docRef.id, ...newProduct });
});

app.put('/api/admin/products/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  await db.collection('products').doc(id).update(req.body);
  const doc = await db.collection('products').doc(id).get();
  res.json({ id, ...doc.data() });
});

app.delete('/api/admin/products/:id', authenticate, isAdmin, async (req, res) => {
  await db.collection('products').doc(req.params.id).delete();
  res.json({ success: true });
});

app.post('/api/orders', async (req, res) => {
  const { items, total, customer } = req.body;
  const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const newOrder = {
    id: orderId,
    items,
    total,
    customer,
    status: 'Processing',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    node: 'KARACHI_NODE_01',
  };
  await db.collection('orders').doc(orderId).set(newOrder);
  res.status(201).json(newOrder);
});

app.get('/api/admin/orders', authenticate, isAdmin, async (req, res) => {
  const snapshot = await db.collection('orders').get();
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(orders);
});

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  await db.collection('subscribers').doc(email).set({ email, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  res.json({ success: true });
});

// --- Reviews endpoint (single, correct version) ---

app.post('/api/products/:id/reviews', authenticate, async (req, res) => {
    
  const { id } = req.params;
  const { rating, comment, name } = req.body;
 const user = (req as any).user;
  const review = {
    name: name || user?.name || 'Anonymous',
    rating,
    comment,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const productRef = db.collection('products').doc(id);
  const productDoc = await productRef.get();
  if (!productDoc.exists) return res.status(404).json({ error: 'Product not found' });
  const currentReviews = productDoc.data()?.reviews || [];
  const updatedReviews = [...currentReviews, review];
  const averageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
  await productRef.update({ reviews: updatedReviews, rating: averageRating });
  res.json({ success: true, rating: averageRating });
});



app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'Firestore', region: 'Pakistan' });
});


export default app;