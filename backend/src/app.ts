import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes';
import { config } from './config';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Essential for cloud deployment, containers, load balancers)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'pulsetrack-backend',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Root API overview
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'PulseTrack Fitness API',
    version: '1.0.0',
    description: 'REST API powering the PulseTrack mobile application',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        demo: 'POST /api/auth/demo',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
      },
      workouts: {
        list: 'GET /api/workouts',
        get: 'GET /api/workouts/:id',
        create: 'POST /api/workouts',
        update: 'PUT /api/workouts/:id',
        delete: 'DELETE /api/workouts/:id',
      },
      stats: {
        today: 'GET /api/stats/today',
        updateToday: 'POST /api/stats/today',
        history: 'GET /api/stats/history',
        summary: 'GET /api/stats/summary',
      },
      nutrition: {
        list: 'GET /api/nutrition',
        create: 'POST /api/nutrition',
        delete: 'DELETE /api/nutrition/:id',
      },
      sleep: {
        list: 'GET /api/sleep',
        create: 'POST /api/sleep',
        delete: 'DELETE /api/sleep/:id',
      },
      goals: {
        list: 'GET /api/goals',
        create: 'POST /api/goals',
        update: 'PUT /api/goals/:id',
        delete: 'DELETE /api/goals/:id',
      },
      sync: {
        batchSync: 'POST /api/sync',
      },
    },
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  });
});

export default app;
