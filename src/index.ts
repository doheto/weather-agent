import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Weather Agent API',
    version: '1.0.0',
    architecture: 'hexagonal'
  });
});

app.listen(PORT, () => {
  console.log(`🌤️  Weather Agent running on port ${PORT}`);
  console.log(`📐 Architecture: Hexagonal (Ports & Adapters)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 