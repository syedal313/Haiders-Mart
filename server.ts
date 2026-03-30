import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import admin from "firebase-admin";

const JWT_SECRET = "haiders-mart-secret-node-01";

// Initialize Firebase Admin (Firestore)
// Initialize Firebase Admin (Firestore)
// Initialize Firebase Admin (Firestore)
if (!admin.apps.length) {
  let serviceAccount: any;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // In production, use the environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // For local development: read from file (this file must exist locally)
    const filePath = path.join(process.cwd(), 'haiders-mart-firebase-adminsdk-fbsvc-995d0f230e.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // ====================== IMAGE + GLB UPLOAD SETUP ======================
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
  });
  const upload = multer({ storage });
  // =================================================================

  // ====================== SEED INITIAL DATA ======================
  async function seedData() {
    // Announcement
    const annRef = db.collection("announcement").doc("current");
    if (!(await annRef.get()).exists) {
      await annRef.set({
        text: "🚀 MEGA SALE: UP TO 50% OFF ON ALL CYBER-KNIT HOODIES! USE CODE: HAIDER50",
        isActive: true,
        link: "#",
        color: "cyan"
      });
      console.log("✅ Seeded announcement");
    }

    // Products
    const productsRef = db.collection("products");
    const productsSnap = await productsRef.get();
    if (productsSnap.empty) {
      const initialProducts = [
        {
          id: "1",
          name: "Cyber-Knit Hoodie",
          category: "Garments",
          price: 4500,
          originalPrice: 9000,
          discountPercentage: 50,
          image: "/uploads/cyber-knit-hoodie-main.jpg", // you can change later
          images: [
            "https://picsum.photos/seed/hoodie/800/800",
            "https://picsum.photos/seed/hoodie2/800/800",
            "https://picsum.photos/seed/hoodie3/800/800"
          ],
          description: "Smart-fabric hoodie with integrated thermal regulation and neon reactive threads.",
          rating: 4.8,
          reviews: [
            { name: "Ali Khan", rating: 5, comment: "Best hoodie I've ever bought! The quality is insane." },
            { name: "Sara Ahmed", rating: 4, comment: "Super comfortable and futuristic look." }
          ]
        },
        {
          id: "2",
          name: "Neon Glow Serum",
          category: "Skincare",
          price: 2800,
          image: "https://picsum.photos/seed/serum/800/800",
          images: [],
          description: "Bioluminescent hydration for a futuristic radiance.",
          rating: 4.9,
          reviews: []
        },
        {
          id: "3",
          name: "Quantum Styling Gel",
          category: "Styling",
          price: 1500,
          image: "https://picsum.photos/seed/gel/800/800",
          images: [],
          description: "Hold your style in place across multiple dimensions.",
          rating: 4.5,
          reviews: []
        },
        {
          id: "4",
          name: "Nano-Vitamins",
          category: "Pharmacy",
          price: 3200,
          image: "https://picsum.photos/seed/vitamins/800/800",
          images: [],
          description: "Targeted nutrient delivery via molecular drones.",
          rating: 4.7,
          reviews: []
        },
        {
          id: "5",
          name: "Holographic Tee",
          category: "Garments",
          price: 2200,
          image: "https://picsum.photos/seed/tee/800/800",
          images: [],
          description: "T-shirt with shifting holographic patterns.",
          rating: 4.6,
          reviews: []
        },
        {
          id: "6",
          name: "Plasma Hair Wax",
          category: "Styling",
          price: 1800,
          image: "https://picsum.photos/seed/wax/800/800",
          images: [],
          description: "High-shine plasma wax for gravity-defying hair.",
          rating: 4.4,
          reviews: []
        },
        {
          id: "7",
          name: "Void Cleanser",
          category: "Skincare",
          price: 3500,
          image: "https://picsum.photos/seed/cleanser/800/800",
          images: [],
          description: "Deep-pore cleansing using microscopic black holes.",
          rating: 4.9,
          reviews: []
        },
        {
          id: "8",
          name: "Neural Focus Tabs",
          category: "Pharmacy",
          price: 5000,
          image: "https://picsum.photos/seed/focus/800/800",
          images: [],
          description: "Enhance cognitive performance with neural-link tech.",
          rating: 4.8,
          reviews: []
        }
      ];

      const batch = db.batch();
      initialProducts.forEach((p) => {
        const docRef = productsRef.doc(p.id);
        batch.set(docRef, p);
      });
      await batch.commit();
      console.log("✅ Seeded 8 products to Firestore");
    }
  }

  await seedData();
  // ============================================================

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // ====================== UPLOAD ROUTES (kept exactly as you had) ======================
  app.post("/api/admin/upload-image", authenticate, isAdmin, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  app.post("/api/admin/upload-glb", authenticate, isAdmin, upload.single("glb"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No GLB file uploaded" });
    const glbUrl = `/uploads/${req.file.filename}`;
    res.json({ glbUrl });
  });
  // =================================================================

  // Auth Routes (unchanged)
    // Auth Routes
   // Auth Routes
  const users = [
    { id: "admin-1", email: "admin@haidersmart.pk", password: await bcrypt.hash("admin123", 10), role: "admin", name: "Haider Admin" },
    { id: "admin-2", email: "1shahali121@gmail.com", password: await bcrypt.hash("#Admin313", 10), role: "admin", name: "Shah Ali Admin" }
  ];

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  });

  app.post("/api/auth/admin-sync", (req, res) => {
    const { email } = req.body;
    if (email === "1shahali121@gmail.com") {
      const token = jwt.sign({ id: "admin-google", email, role: "admin", name: "Admin (Google)" }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'none' });
      return res.json({ success: true, user: { email, role: "admin", name: "Admin (Google)" } });
    }
    res.status(403).json({ error: "Forbidden" });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ user: decoded });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });
  // ====================== FIRESTORE ROUTES ======================
  // Announcement
  app.get("/api/announcement", async (req, res) => {
    const doc = await db.collection("announcement").doc("current").get();
    res.json(doc.exists ? doc.data() : { text: "", isActive: false, link: "#", color: "cyan" });
  });

  app.post("/api/admin/announcement", authenticate, isAdmin, async (req, res) => {
    await db.collection("announcement").doc("current").set(req.body, { merge: true });
    const updated = await db.collection("announcement").doc("current").get();
    res.json(updated.data());
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  });

  app.post("/api/admin/products", authenticate, isAdmin, async (req, res) => {
    const newProduct = { ...req.body, rating: req.body.rating || 5.0 };
    const docRef = await db.collection("products").add(newProduct);
    res.status(201).json({ id: docRef.id, ...newProduct });
  });

  app.put("/api/admin/products/:id", authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    await db.collection("products").doc(id).update(req.body);
    const doc = await db.collection("products").doc(id).get();
    res.json({ id, ...doc.data() });
  });

  app.delete("/api/admin/products/:id", authenticate, isAdmin, async (req, res) => {
    await db.collection("products").doc(req.params.id).delete();
    res.json({ success: true });
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    const { items, total, customer } = req.body;
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newOrder = {
      id: orderId,
      items,
      total,
      customer,
      status: "Processing",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      node: "KARACHI_NODE_01"
    };

    await db.collection("orders").doc(orderId).set(newOrder);
    res.status(201).json(newOrder);
  });

  app.get("/api/admin/orders", authenticate, isAdmin, async (req, res) => {
    const snapshot = await db.collection("orders").get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), db: "Firestore", region: "Pakistan" });
  });

  // Vite + Production serving (unchanged)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Haiders Mart + Firestore running on http://localhost:${PORT}`);
  });
}

startServer();