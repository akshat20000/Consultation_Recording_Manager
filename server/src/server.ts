import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server listener
    const port = env.PORT;
    app.listen(port, () => {
      console.log(`[Server] Consultation Recording Manager Server running on port ${port} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('[Startup Error] Server initialization failed:', error);
    process.exit(1);
  }
};

startServer();
