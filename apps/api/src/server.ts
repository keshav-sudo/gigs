import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import gigRoutes from './routes/gig.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { getGenerationHistory } from './controllers/ai.controller.js';
import { authMiddleware } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express parser with limit check
app.use(express.json({ limit: '2mb' }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit each IP to 15 AI requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI limit reached. Please wait an hour before generating new gigs.' }
});

app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/ai', aiRoutes);

// Direct mapping for GET /api/history
app.get('/api/history', authMiddleware as any, getGenerationHistory as any);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'GigCraft AI API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error. Please contact support.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
