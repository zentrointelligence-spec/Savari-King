const db = require('./src/config/db');

async function checkStructure() {
  try {
    const result = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'packagetiers'
      ORDER BY ordinal_position
    `);

    console.log('\n=== PackageTiers Table Structure ===');
    result.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStructure();
