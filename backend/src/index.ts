import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { emotionalDataRoutes } from './database/routes/emotionalData';
import { errorHandler } from './database/middleware/errorHandler';
import { notFoundHandler } from './database/middleware/notFoundHandler';

// Load environment variables
dotenv.config({ path: './src/.env' });

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'HackTX25 Backend API'
  });
});

// API routes
app.use('/api/emotional-data', emotionalDataRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Emotional data API: http://localhost:${PORT}/api/emotional-data`);
  console.log(`📱 Mobile access: http://10.148.16.170:${PORT}/api/emotional-data`);
});

export default app;