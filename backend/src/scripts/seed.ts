
import sequelize from '../config/database';
import { seedDatabase } from '../services/seeder.service';

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // Pass false to not force sync here, or true if you want the script to always reset
        // The original script didn't have force: true uncommented, but had logic to findOrCreate.
        // The new service has findOrCreate logic, so we can just call it.
        // If the user wants to RESET, they use the Admin API.
        // If they just want to SEED missing data, they run this script.
        await seedDatabase(false);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();

