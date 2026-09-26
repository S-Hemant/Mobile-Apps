import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`🚀 PulseTrack Backend running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/health`);
});

const handleShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Forcefully terminating server.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
