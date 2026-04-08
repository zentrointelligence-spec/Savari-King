/**
 * TEST END-TO-END AUTOMATISÉ - AUTO-VALIDATE
 *
 * Ce script teste complètement le bouton auto-validate:
 * 1. Se connecte en tant qu'admin
 * 2. Récupère un booking avec statut "Inquiry Pending" ou "Under Review"
 * 3. Démarre une review si nécessaire
 * 4. Exécute l'auto-validation
 * 5. Vérifie les résultats
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@test.com'; // Email admin trouvé dans la base
const ADMIN_PASSWORD = 'admin123'; // Mot de passe par défaut (à confirmer)

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Fonctions utilitaires
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Variables globales pour le test
let adminToken = null;
let testBooking = null;
let testRevision = null;

/**
 * Étape 1: Connexion Admin
 */
async function loginAsAdmin() {
  logSection('ÉTAPE 1: CONNEXION ADMIN');

  try {
    logInfo(`Tentative de connexion avec: ${ADMIN_EMAIL}`);

    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    // Le backend peut retourner soit success: true, soit message: 'Login successful'
    if ((response.data.success || response.data.message === 'Login successful') && response.data.token) {
      adminToken = response.data.token;
      logSuccess(`Connexion réussie!`);
      logInfo(`Token: ${adminToken.substring(0, 20)}...`);
      logInfo(`User ID: ${response.data.user?.id}`);
      logInfo(`User Name: ${response.data.user?.full_name || response.data.user?.name}`);
      logInfo(`User Role: ${response.data.user?.role}`);
      logInfo(`Is Admin: ${response.data.user?.is_admin || (response.data.user?.role === 'admin')}`);

      const isAdmin = response.data.user?.is_admin || response.data.user?.role === 'admin';
      if (!isAdmin) {
        logError('ERREUR: Cet utilisateur n\'est pas admin!');
        process.exit(1);
      }

      return true;
    } else {
      logError('Réponse de connexion invalide');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    logError('Erreur lors de la connexion:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Data:', error.response.data);
    } else {
      console.log(error.message);
    }
    return false;
  }
}

/**
 * Étape 2: Trouver un booking de test
 */
async function findTestBooking() {
  logSection('ÉTAPE 2: RECHERCHE D\'UN BOOKING DE TEST');

  try {
    logInfo('Recherche de bookings avec statut "Inquiry Pending" ou "Under Review"...');

    const response = await axios.get(`${BASE_URL}/bookings/admin/all?limit=50`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      const allBookings = response.data.data;
      logInfo(`Total de bookings trouvés: ${allBookings.length}`);

      // Chercher un booking avec le bon statut
      testBooking = allBookings.find(b =>
        b.status === 'Inquiry Pending' || b.status === 'Under Review'
      );

      if (testBooking) {
        logSuccess(`Booking trouvé: #${testBooking.id}`);
        logInfo(`Statut: ${testBooking.status}`);
        logInfo(`Tour: ${testBooking.tour_name}`);
        logInfo(`Client: ${testBooking.user_name || testBooking.contact_name}`);
        logInfo(`Date de voyage: ${testBooking.travel_date}`);
        logInfo(`Participants: ${testBooking.num_adults} adultes, ${testBooking.num_children} enfants`);
        return true;
      } else {
        logWarning('Aucun booking avec statut "Inquiry Pending" ou "Under Review" trouvé.');

        // Si pas de booking trouvé, prendre le premier disponible
        if (allBookings.length > 0) {
          testBooking = allBookings[0];
          logWarning(`Utilisation du booking #${testBooking.id} (statut: ${testBooking.status})`);
          return true;
        } else {
          logError('Aucun booking disponible pour le test!');
          return false;
        }
      }
    } else {
      logError('Échec de récupération des bookings');
      return false;
    }
  } catch (error) {
    logError('Erreur lors de la recherche de bookings:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Data:', error.response.data);
    } else {
      console.log(error.message);
    }
    return false;
  }
}

/**
 * Étape 3: Vérifier/Créer une révision active
 */
async function ensureActiveRevision() {
  logSection('ÉTAPE 3: VÉRIFICATION/CRÉATION DE LA RÉVISION');

  try {
    logInfo(`Vérification de la révision active pour booking #${testBooking.id}...`);

    // Essayer de récupérer la révision active
    try {
      const response = await axios.get(
        `${BASE_URL}/bookings/${testBooking.id}/review/active`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data) {
        testRevision = response.data.data;
        logSuccess(`Révision active trouvée: #${testRevision.id}`);
        logInfo(`Statut de review: ${testRevision.review_status}`);
        logInfo(`Score de validation: ${testRevision.validation_score || 0}%`);
        logInfo(`Sections validées: ${testRevision.all_sections_validated ? 'Oui' : 'Non'}`);
        return true;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logInfo('Aucune révision active trouvée, création d\'une nouvelle...');
      } else {
        throw error;
      }
    }

    // Créer une nouvelle révision
    logInfo('Démarrage d\'une nouvelle review...');
    const startResponse = await axios.post(
      `${BASE_URL}/bookings/${testBooking.id}/review/start`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (startResponse.data.success) {
      const revisionId = startResponse.data.data.revisionId;
      logSuccess(`Nouvelle révision créée: #${revisionId}`);

      // Récupérer les détails de la révision
      const revisionResponse = await axios.get(
        `${BASE_URL}/bookings/${testBooking.id}/review/active`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (revisionResponse.data.success) {
        testRevision = revisionResponse.data.data;
        logSuccess('Révision récupérée avec succès!');
        return true;
      }
    }

    logError('Impossible de créer ou récupérer une révision');
    return false;
  } catch (error) {
    logError('Erreur lors de la gestion de la révision:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Data:', error.response.data);
    } else {
      console.log(error.message);
    }
    return false;
  }
}

/**
 * Étape 4: Exécuter l'auto-validation
 */
async function runAutoValidation() {
  logSection('ÉTAPE 4: EXÉCUTION DE L\'AUTO-VALIDATION');

  try {
    const url = `${BASE_URL}/bookings/${testBooking.id}/review/${testRevision.id}/auto-validate`;
    logInfo(`URL: ${url}`);
    logInfo('Envoi de la requête...');

    const startTime = Date.now();

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const duration = Date.now() - startTime;

    logSuccess(`Auto-validation réussie! (${duration}ms)`);
    console.log('\n' + '-'.repeat(60));
    log('RÉPONSE COMPLÈTE:', 'bright');
    console.log('-'.repeat(60));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('-'.repeat(60) + '\n');

    if (response.data.success) {
      logSuccess('✨ AUTO-VALIDATION TERMINÉE AVEC SUCCÈS!');

      const revision = response.data.data?.revision;
      const validation = response.data.data?.validation;
      const pricing = response.data.data?.pricing;

      if (revision) {
        console.log('\n📊 RÉSULTATS DE LA RÉVISION:');
        console.log(`   Score de validation: ${revision.validation_score || 0}%`);
        console.log(`   Toutes sections validées: ${revision.all_sections_validated ? '✅ Oui' : '❌ Non'}`);
        console.log(`   Prix de base: ₹${parseFloat(revision.base_price || 0).toLocaleString('en-IN')}`);
        console.log(`   Prix véhicules: ₹${parseFloat(revision.vehicles_price || 0).toLocaleString('en-IN')}`);
        console.log(`   Prix addons: ₹${parseFloat(revision.addons_price || 0).toLocaleString('en-IN')}`);
        console.log(`   Prix final: ₹${parseFloat(revision.final_price || 0).toLocaleString('en-IN')}`);
      }

      if (validation) {
        console.log('\n🔍 DÉTAILS DE LA VALIDATION:');
        console.log(`   Score: ${validation.validation_score || 0}%`);

        if (validation.tier_validation) {
          console.log(`   Tier disponible: ${validation.tier_validation.available ? '✅' : '❌'}`);
        }

        if (validation.vehicles_validation) {
          console.log(`   Véhicules validés: ${validation.vehicles_validation.validated ? '✅' : '❌'}`);
          console.log(`   Capacité totale: ${validation.vehicles_validation.total_capacity || 0}`);
        }

        if (validation.addons_validation) {
          console.log(`   Addons validés: ${validation.addons_validation.validated ? '✅' : '❌'}`);
        }

        if (validation.participants_validation) {
          console.log(`   Participants validés: ${validation.participants_validation.validated ? '✅' : '❌'}`);
        }

        if (validation.date_validation) {
          console.log(`   Date validée: ${validation.date_validation.validated ? '✅' : '❌'}`);
        }
      }

      if (pricing) {
        console.log('\n💰 DÉTAILS DU PRICING:');
        console.log(`   Prix de base: ₹${parseFloat(pricing.pricing.base_price || 0).toLocaleString('en-IN')}`);
        console.log(`   Sous-total: ₹${parseFloat(pricing.pricing.subtotal_price || 0).toLocaleString('en-IN')}`);
        console.log(`   Remises: ₹${parseFloat(pricing.pricing.total_discounts || 0).toLocaleString('en-IN')}`);
        console.log(`   Frais: ₹${parseFloat(pricing.pricing.total_fees || 0).toLocaleString('en-IN')}`);
        console.log(`   Prix final: ₹${parseFloat(pricing.pricing.final_price || 0).toLocaleString('en-IN')}`);
      }

      return true;
    } else {
      logError('La validation a échoué');
      console.log('Réponse:', response.data);
      return false;
    }
  } catch (error) {
    logError('❌ ERREUR LORS DE L\'AUTO-VALIDATION!');

    if (error.response) {
      console.log(`\nHTTP Status: ${error.response.status}`);
      console.log('\nRéponse d\'erreur:');
      console.log(JSON.stringify(error.response.data, null, 2));

      // Analyse de l'erreur
      if (error.response.status === 401) {
        logError('\n⚠️  Erreur d\'authentification - Token invalide ou expiré');
      } else if (error.response.status === 403) {
        logError('\n⚠️  Accès refusé - Permissions insuffisantes');
      } else if (error.response.status === 404) {
        logError('\n⚠️  Endpoint non trouvé - Vérifier que le serveur est démarré');
      } else if (error.response.status === 400) {
        logError('\n⚠️  Requête invalide - Vérifier les données');
      } else if (error.response.status === 500) {
        logError('\n⚠️  Erreur serveur - Vérifier les logs du backend');
      }
    } else if (error.request) {
      logError('\n⚠️  Aucune réponse du serveur');
      logError('Le serveur est-il démarré sur http://localhost:5000 ?');
    } else {
      logError('\n⚠️  Erreur de configuration de la requête');
      console.log(error.message);
    }

    console.log('\n📋 Erreur complète:');
    console.log(error);

    return false;
  }
}

/**
 * Fonction principale du test
 */
async function runTest() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'bright');
  log('║   TEST END-TO-END AUTOMATISÉ - AUTO-VALIDATE             ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'bright');
  console.log('\n');

  logInfo(`URL du serveur: ${BASE_URL}`);
  logInfo(`Email admin: ${ADMIN_EMAIL}`);
  console.log('\n');

  let allStepsSuccess = true;

  // Étape 1: Connexion
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    logError('\n❌ TEST ÉCHOUÉ - Impossible de se connecter');
    process.exit(1);
  }

  // Étape 2: Trouver un booking
  const bookingSuccess = await findTestBooking();
  if (!bookingSuccess) {
    logError('\n❌ TEST ÉCHOUÉ - Aucun booking disponible');
    process.exit(1);
  }

  // Étape 3: Révision active
  const revisionSuccess = await ensureActiveRevision();
  if (!revisionSuccess) {
    logError('\n❌ TEST ÉCHOUÉ - Impossible de créer/récupérer une révision');
    process.exit(1);
  }

  // Étape 4: Auto-validation
  const validationSuccess = await runAutoValidation();
  if (!validationSuccess) {
    allStepsSuccess = false;
  }

  // Résumé final
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'bright');
  if (allStepsSuccess) {
    log('║   ✅ TEST RÉUSSI - AUTO-VALIDATE FONCTIONNE!             ║', 'green');
  } else {
    log('║   ❌ TEST ÉCHOUÉ - AUTO-VALIDATE NE FONCTIONNE PAS       ║', 'red');
  }
  log('╚═══════════════════════════════════════════════════════════╝', 'bright');
  console.log('\n');

  if (allStepsSuccess) {
    logSuccess('Le bouton auto-validate fonctionne correctement! 🎉');
    process.exit(0);
  } else {
    logError('Le bouton auto-validate a des problèmes. Voir les logs ci-dessus.');
    process.exit(1);
  }
}

// Exécuter le test
runTest().catch(error => {
  console.error('\n💥 ERREUR FATALE:');
  console.error(error);
  process.exit(1);
});
