const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl:
        process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'ebookingsam',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
    });

const MIGRATIONS_DIR = path.join(__dirname, 'src', 'db', 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';
const CORE_ORDER = [
  'create_bookings_table.sql',
  'create_booking_quote_revisions_table.sql',
  'create_email_logs_table.sql',
  'create_notifications_table.sql',
  'create_wishlist_table.sql',
  'create_vehicle_images_table.sql',
  'create_vehicle_reviews_table.sql',
  'create_blog_comments_table.sql',
  'create_blog_likes_table.sql',
  'create_blog_post_translations.sql',
  'create_blog_ratings_table.sql',
  'create_blog_statistics_triggers.sql',
  'create_currency_system.sql',
  'optimize_destinations_queries.sql',
];

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Running: ${path.basename(filePath)}`);
  await client.query(sql);
  console.log(`Done: ${path.basename(filePath)}\n`);
}

async function runMigrations(options = {}) {
  const checkOnlyArg = process.argv.includes('--check-only');
  const checkOnly = options.checkOnly === true ? true : checkOnlyArg;
  const force = options.force === true ? true : process.env.MIGRATIONS_FORCE === 'true';
  const client = await pool.connect();
  try {
    const start = Date.now();
    let targetInfo = '';
    if (connectionString) {
      try {
        const u = new URL(connectionString);
        const dbname = u.pathname ? u.pathname.replace('/', '') : '';
        const sslmode = u.searchParams.get('sslmode') || '';
        targetInfo = `user=${u.username} host=${u.hostname} port=${u.port} db=${dbname} sslmode=${sslmode}`;
      } catch {
        targetInfo = `database_url_detected`;
      }
    } else {
      targetInfo = `user=${process.env.DB_USER || ''} host=${process.env.DB_HOST || ''} port=${process.env.DB_PORT || ''} db=${process.env.DB_DATABASE || ''}`;
    }
    console.log(`🔧 Migrations init: checkOnly=${checkOnly} force=${force}`);
    console.log(`🗄️ Target: ${targetInfo}`);
    const baseTables = ['users','tours','destinations','vehicles','blog_posts','packagetiers'];
    const missing = [];
    for (const t of baseTables) {
      const r = await client.query(
        "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) AS exists",
        [t]
      );
      if (!r.rows[0].exists) missing.push(t);
    }
    if (missing.length > 0) {
      console.error(`❗ Base schema missing: ${missing.join(', ')}`);
      console.error(`❗ Importez la base locale sur Render ou créez les tables de base avant d'appliquer les migrations.`);
      throw new Error('Base schema missing');
    }
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (file_name TEXT PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
    );
    const allFiles = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
    const coreFiles = CORE_ORDER.filter((f) => allFiles.includes(f));
    const remaining = allFiles.filter((f) => !coreFiles.includes(f)).sort();
    const appliedCountRes = await client.query(`SELECT COUNT(*) AS count FROM ${MIGRATIONS_TABLE}`);
    const appliedCount = parseInt(appliedCountRes.rows[0].count, 10) || 0;
    const totalCount = allFiles.length;
    const pendingCount = Math.max(totalCount - appliedCount, 0);
    console.log(`🚀 Starting migrations... total=${totalCount} applied=${appliedCount} pending=${pendingCount}\n`);
    for (const f of [...coreFiles, ...remaining]) {
      const filePath = path.join(MIGRATIONS_DIR, f);
      try {
        const exists = await client.query(`SELECT 1 FROM ${MIGRATIONS_TABLE} WHERE file_name=$1`, [f]);
        const already = exists.rowCount > 0;
        if (!force && already) {
          console.log(`⏭️ Skip: ${f}`);
          continue;
        }
        if (checkOnly && !already) {
          console.log(`🟡 Pending: ${f}`);
          continue;
        }
        if (!checkOnly) {
          await runSqlFile(client, filePath);
          await client.query(
            `INSERT INTO ${MIGRATIONS_TABLE}(file_name) VALUES($1) ON CONFLICT (file_name) DO NOTHING`,
            [f]
          );
        }
      } catch (err) {
        console.error(`❌ Error in ${f}:`, err.message);
      }
    }
    const durationMs = Date.now() - start;
    console.log(`✅ Migrations completed in ${durationMs}ms.`);
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  await runMigrations();
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Migration runner failed:', e);
    process.exit(1);
  });
}

module.exports = { runMigrations };
