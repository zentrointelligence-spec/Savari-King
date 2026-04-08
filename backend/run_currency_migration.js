require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Create a direct database connection for migrations
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'ebookingsam',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log('📦 Running currency system migration...\n');

    // Read the SQL file
    const sqlContent = fs.readFileSync(
      './src/db/migrations/create_currency_system.sql',
      'utf8'
    );

    // Execute the migration
    await pool.query(sqlContent);

    console.log('\n✅ Currency system migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
