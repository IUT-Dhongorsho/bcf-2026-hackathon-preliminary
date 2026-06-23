import { db } from './index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
    try {
        console.log('Connecting to database...');
        
        // Resolve path to the generated_data.sql file
        const sqlFilePath = path.join(__dirname, '../../../data/generated_data.sql');
        console.log(`Reading SQL file from: ${sqlFilePath}`);
        
        const sql = await fs.readFile(sqlFilePath, 'utf-8');
        
        console.log('Executing SQL file (this may take a moment)...');
        await db.query(sql);
        
        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding the database:', error);
        process.exit(1);
    } finally {
        // Close the database pool
        await db.end();
    }
}

seedDatabase();
