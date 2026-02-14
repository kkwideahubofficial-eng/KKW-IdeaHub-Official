import cron from 'node-cron';
import axios from 'axios';

// URL provided by the user
const PING_URL = 'https://ideahub-app.onrender.com';

const task = () => {
    // Schedule task to run every 12 minutes
    console.log(`Cron job scheduled: Pinging ${PING_URL} every 12 minutes to keep service active.`);
    
    cron.schedule('*/12 * * * *', async () => {
        try {
            console.log(`[${new Date().toISOString()}] Sending ping to keep service active...`);
            const response = await axios.get(PING_URL);
            console.log(`[${new Date().toISOString()}] Ping successful: Status ${response.status}`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
        }
    });
};

export default task;
