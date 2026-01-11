
import sequelize from '../config/database';
import { seedDatabase } from '../services/seeder.service';

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // FORCE REWRITE = true to wipe and replace data
        await seedDatabase(true);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
