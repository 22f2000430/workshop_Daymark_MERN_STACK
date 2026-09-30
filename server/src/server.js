import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';

try {
  await connectDatabase();
  app.listen(env.port, () => console.log(`Daymark API listening on http://localhost:${env.port}`));
} catch (error) {
  console.error('Unable to start Daymark API:', error.message);
  process.exit(1);
}
