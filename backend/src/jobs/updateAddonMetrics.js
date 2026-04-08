/**
 * Update Addon Metrics Job
 *
 * Ce script met à jour automatiquement les métriques (popularité et rating)
 * de tous les addons basé sur les données réelles de réservations et avis.
 *
 * Usage:
 *   node src/jobs/updateAddonMetrics.js
 *
 * Peut être exécuté via CRON quotidiennement:
 *   0 2 * * * cd /path/to/backend && node src/jobs/updateAddonMetrics.js
 */

const { Pool } = require('pg');

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

/**
 * Met à jour les métriques de tous les addons
 */
async function updateAllAddonMetrics() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting addon metrics update...');
    console.log('📅 Date:', new Date().toISOString());
    console.log('─'.repeat(60));

    // Exécuter la fonction de mise à jour
    const result = await client.query('SELECT * FROM update_all_addon_metrics()');

    console.log(`✅ Successfully updated ${result.rows.length} addons\n`);

    // Afficher un résumé des mises à jour
    console.log('📊 Updated Metrics Summary:');
    console.log('─'.repeat(60));
    console.log('ID  | Popularity | Rating');
    console.log('─'.repeat(60));

    result.rows.forEach(row => {
      console.log(
        `${String(row.addon_id).padEnd(4)}| ${String(row.new_popularity + '%').padEnd(11)}| ${row.new_rating}/5`
      );
    });

    console.log('─'.repeat(60));

    // Obtenir les statistiques détaillées
    const statsResult = await client.query(`
      SELECT
        COUNT(*) as total_addons,
        AVG(popularity)::NUMERIC(10,2) as avg_popularity,
        AVG(rating)::NUMERIC(10,2) as avg_rating,
        MAX(popularity) as max_popularity,
        MIN(popularity) as min_popularity
      FROM addons
      WHERE is_active = true
    `);

    const stats = statsResult.rows[0];
    console.log('\n📈 Overall Statistics:');
    console.log('─'.repeat(60));
    console.log(`Total Active Addons: ${stats.total_addons}`);
    console.log(`Average Popularity: ${stats.avg_popularity}%`);
    console.log(`Average Rating: ${stats.avg_rating}/5`);
    console.log(`Popularity Range: ${stats.min_popularity}% - ${stats.max_popularity}%`);
    console.log('─'.repeat(60));

    // Identifier les addons qui ont besoin d'attention
    const attentionResult = await client.query(`
      SELECT id, name, popularity, rating
      FROM addons
      WHERE is_active = true
        AND (popularity < 30 OR rating < 3.5)
      ORDER BY popularity ASC, rating ASC
    `);

    if (attentionResult.rows.length > 0) {
      console.log('\n⚠️  Addons needing attention (low popularity or rating):');
      console.log('─'.repeat(60));
      attentionResult.rows.forEach(addon => {
        console.log(`- ${addon.name}: ${addon.popularity}% popularity, ${addon.rating}/5 rating`);
      });
      console.log('─'.repeat(60));
    }

    console.log('\n✨ Addon metrics update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating addon metrics:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtient un rapport détaillé des métriques
 */
async function getMetricsReport() {
  const client = await pool.connect();

  try {
    console.log('📋 Generating Addon Metrics Report...');
    console.log('─'.repeat(100));

    const result = await client.query('SELECT * FROM get_addon_metrics_report()');

    console.log('ID  | Name                           | Category    | Curr Pop | Calc Pop | Curr Rat | Calc Rat | Reviews | Bookings | Update?');
    console.log('─'.repeat(100));

    result.rows.forEach(row => {
      console.log(
        `${String(row.addon_id).padEnd(4)}| ` +
        `${row.addon_name.substring(0, 30).padEnd(31)}| ` +
        `${row.category.padEnd(12)}| ` +
        `${String(row.current_popularity + '%').padEnd(9)}| ` +
        `${String(row.calculated_popularity + '%').padEnd(9)}| ` +
        `${String(row.current_rating).padEnd(9)}| ` +
        `${String(row.calculated_rating).padEnd(9)}| ` +
        `${String(row.review_count).padEnd(8)}| ` +
        `${String(row.booking_count).padEnd(9)}| ` +
        `${row.needs_update ? '⚠️  YES' : '✅ NO'}`
      );
    });

    console.log('─'.repeat(100));

  } catch (error) {
    console.error('❌ Error generating report:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Met à jour les métriques d'un addon spécifique
 */
async function updateSpecificAddon(addonId) {
  const client = await pool.connect();

  try {
    console.log(`🔄 Updating metrics for addon ID: ${addonId}...`);

    const result = await client.query('SELECT update_addon_metrics($1)', [addonId]);

    const addonResult = await client.query(
      'SELECT id, name, popularity, rating FROM addons WHERE id = $1',
      [addonId]
    );

    if (addonResult.rows.length > 0) {
      const addon = addonResult.rows[0];
      console.log(`✅ Updated addon: ${addon.name}`);
      console.log(`   Popularity: ${addon.popularity}%`);
      console.log(`   Rating: ${addon.rating}/5`);
    }

  } catch (error) {
    console.error(`❌ Error updating addon ${addonId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'report':
        await getMetricsReport();
        break;

      case 'update':
        if (args[1]) {
          // Mettre à jour un addon spécifique
          await updateSpecificAddon(parseInt(args[1]));
        } else {
          // Mettre à jour tous les addons
          await updateAllAddonMetrics();
        }
        break;

      case 'help':
      default:
        console.log('📖 Addon Metrics Update Tool');
        console.log('─'.repeat(60));
        console.log('Usage:');
        console.log('  node updateAddonMetrics.js update          - Update all addons');
        console.log('  node updateAddonMetrics.js update <id>     - Update specific addon');
        console.log('  node updateAddonMetrics.js report          - Generate metrics report');
        console.log('  node updateAddonMetrics.js help            - Show this help');
        console.log('─'.repeat(60));

        if (!command) {
          // Si aucune commande, exécuter la mise à jour par défaut
          await updateAllAddonMetrics();
        }
        break;
    }

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  updateAllAddonMetrics,
  updateSpecificAddon,
  getMetricsReport
};
