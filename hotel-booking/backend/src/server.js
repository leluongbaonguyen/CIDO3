import app from './app.js';
import dotenv from 'dotenv';
import { initCronJobs } from './utils/cron.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs
initCronJobs();

// Initialize app server with absolute static paths
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
