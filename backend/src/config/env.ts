import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory (../../.env from src/config)
try {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
} catch (e) {
    console.log('Could not load local .env file, relying on environment variables.');
}
