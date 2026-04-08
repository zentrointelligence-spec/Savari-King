/**
 * Script pour réinitialiser le mot de passe admin
 */

const bcrypt = require('./backend/node_modules/bcryptjs');
const { Pool } = require('./backend/node_modules/pg');

// Configuration PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ebookingsam',
  password: 'postgres',
  port: 5432,
});

const NEW_PASSWORD = 'admin123';
const ADMIN_EMAIL = 'admin@test.com';

async function resetPassword() {
  try {
    console.log('🔐 Réinitialisation du mot de passe admin...\n');

    // Hasher le nouveau mot de passe
    console.log(`Hashing du mot de passe: "${NEW_PASSWORD}"`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
    console.log(`✅ Hash généré: ${hashedPassword.substring(0, 30)}...\n`);

    // Mettre à jour dans la base de données
    console.log(`Mise à jour du mot de passe pour: ${ADMIN_EMAIL}`);
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, full_name, email, role',
      [hashedPassword, ADMIN_EMAIL]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Mot de passe mis à jour avec succès!\n');
      console.log('Détails de l\'utilisateur:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Nom: ${user.full_name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Rôle: ${user.role}`);
      console.log('\n✨ Vous pouvez maintenant vous connecter avec:');
      console.log(`  Email: ${ADMIN_EMAIL}`);
      console.log(`  Mot de passe: ${NEW_PASSWORD}`);
    } else {
      console.log('❌ Aucun utilisateur trouvé avec cet email');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error);
    await pool.end();
    process.exit(1);
  }
}

resetPassword();
