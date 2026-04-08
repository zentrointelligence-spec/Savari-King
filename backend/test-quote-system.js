/**
 * Script de test complet pour le système de Quote Review & Payment
 *
 * Ce script teste:
 * 1. Création d'une réservation
 * 2. Création de la révision initiale
 * 3. Validation des véhicules et addons
 * 4. Génération et envoi des PDFs
 * 5. Logging des emails
 * 6. Création d'une nouvelle révision
 * 7. Paiement simulé
 * 8. Vérification des email logs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let userToken = '';
let testBookingId = null;
let testRevisionId = null;

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}\n📋 ${msg}${colors.reset}`)
};

/**
 * Étape 1: Connexion Admin
 */
async function loginAsAdmin() {
  log.step('ÉTAPE 1: Connexion Admin');
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    adminToken = response.data.token;
    log.success(`Admin connecté. Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    log.error(`Échec de connexion admin: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Étape 2: Connexion User (ou création)
 */
async function loginAsUser() {
  log.step('ÉTAPE 2: Connexion Utilisateur');
  try {
    // Essayer de se connecter d'abord
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: 'testuser@example.com',
        password: 'test123'
      });
      userToken = response.data.token;
      log.success(`Utilisateur connecté. Token: ${userToken.substring(0, 20)}...`);
      return true;
    } catch (loginError) {
      // Si l'utilisateur n'existe pas, le créer
      log.info('Utilisateur non trouvé, création en cours...');
      const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, {
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'test123',
        phone: '+911234567890'
      });
      userToken = registerResponse.data.token;
      log.success('Nouvel utilisateur créé et connecté');
      return true;
    }
  } catch (error) {
    log.error(`Échec de connexion utilisateur: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Étape 3: Créer une réservation de test
 */
async function createTestBooking() {
  log.step('ÉTAPE 3: Création d\'une réservation de test');
  try {
    const bookingData = {
      tourId: 1, // Assumer que le tour ID 1 existe
      tierId: 1,
      travelDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
      numAdults: 2,
      numChildren: 1,
      selectedVehicles: [
        { vehicleId: 1, quantity: 1 }
      ],
      selectedAddons: [
        { addonId: 1, quantity: 2 }
      ],
      contactName: 'Test User',
      contactEmail: 'testuser@example.com',
      contactPhone: '+911234567890',
      specialRequests: 'Test booking for quote system validation'
    };

    const response = await axios.post(
      `${API_BASE_URL}/bookings`,
      bookingData,
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );

    testBookingId = response.data.data.id;
    log.success(`Réservation créée avec ID: ${testBookingId}`);
    log.info(`Référence: ${response.data.data.booking_reference}`);
    return true;
  } catch (error) {
    log.error(`Échec création réservation: ${error.response?.data?.error || error.message}`);
    log.error(`Détails: ${JSON.stringify(error.response?.data)}`);
    return false;
  }
}

/**
 * Étape 4: Récupérer les détails de la réservation (Admin)
 */
async function getBookingDetails() {
  log.step('ÉTAPE 4: Récupération des détails de la réservation');
  try {
    const response = await axios.get(
      `${API_BASE_URL}/bookings/admin/${testBookingId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const booking = response.data.data;
    log.success(`Détails récupérés pour booking #${testBookingId}`);
    log.info(`Status: ${booking.status}`);
    log.info(`Prix estimé: ₹${booking.estimated_price}`);
    return booking;
  } catch (error) {
    log.error(`Échec récupération: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

/**
 * Étape 5: Créer la révision initiale
 */
async function createInitialRevision() {
  log.step('ÉTAPE 5: Création de la révision initiale');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${testBookingId}/review/initialize`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    testRevisionId = response.data.data.revision.id;
    log.success(`Révision créée avec ID: ${testRevisionId}`);
    log.info(`Version: ${response.data.data.revision.revision_number}`);
    return true;
  } catch (error) {
    log.error(`Échec création révision: ${error.response?.data?.error || error.message}`);
    log.info('La révision existe peut-être déjà, continuons...');

    // Essayer de récupérer la révision existante
    try {
      const revisionResponse = await axios.get(
        `${API_BASE_URL}/bookings/${testBookingId}/review`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      testRevisionId = revisionResponse.data.data.revision.id;
      log.success(`Révision existante trouvée avec ID: ${testRevisionId}`);
      return true;
    } catch (getError) {
      return false;
    }
  }
}

/**
 * Étape 6: Valider les véhicules
 */
async function validateVehicles() {
  log.step('ÉTAPE 6: Validation des véhicules');
  try {
    const response = await axios.put(
      `${API_BASE_URL}/bookings/${testBookingId}/review/${testRevisionId}/vehicles`,
      {
        vehicles: [
          {
            name: 'Test Vehicle',
            quantity: 1,
            unitPrice: 5000,
            capacity: 4
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    log.success('Véhicules validés avec succès');
    log.info(`Prix total véhicules: ₹${response.data.data.vehicles_price}`);
    return true;
  } catch (error) {
    log.error(`Échec validation véhicules: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Étape 7: Valider les add-ons
 */
async function validateAddons() {
  log.step('ÉTAPE 7: Validation des add-ons');
  try {
    const response = await axios.put(
      `${API_BASE_URL}/bookings/${testBookingId}/review/${testRevisionId}/addons`,
      {
        addons: [
          {
            name: 'Test Addon',
            quantity: 2,
            unitPrice: 500
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    log.success('Add-ons validés avec succès');
    log.info(`Prix total add-ons: ₹${response.data.data.addons_price}`);
    return true;
  } catch (error) {
    log.error(`Échec validation add-ons: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Étape 8: Envoyer le quote (génération PDFs + email)
 */
async function sendQuote() {
  log.step('ÉTAPE 8: Envoi du quote (PDFs + Email)');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${testBookingId}/review/${testRevisionId}/send-quote`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    log.success('Quote envoyé avec succès!');
    log.info(`PDFs générés:`);
    log.info(`  - Detailed: ${response.data.data.detailedPdf || 'N/A'}`);
    log.info(`  - General: ${response.data.data.generalPdf || 'N/A'}`);
    log.info(`Expiration: ${response.data.data.expirationDate}`);
    return true;
  } catch (error) {
    log.error(`Échec envoi quote: ${error.response?.data?.error || error.message}`);
    log.error(`Détails: ${JSON.stringify(error.response?.data)}`);
    return false;
  }
}

/**
 * Étape 9: Vérifier les email logs
 */
async function checkEmailLogs() {
  log.step('ÉTAPE 9: Vérification des email logs');
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/email-logs?booking_id=${testBookingId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const emails = response.data.data.emails;
    log.success(`${emails.length} email(s) trouvé(s) pour cette réservation`);

    emails.forEach((email, index) => {
      log.info(`\nEmail #${index + 1}:`);
      log.info(`  Type: ${email.email_type}`);
      log.info(`  Destinataire: ${email.recipient_email}`);
      log.info(`  Sujet: ${email.subject}`);
      log.info(`  Statut: ${email.status}`);
      log.info(`  Date: ${new Date(email.sent_at).toLocaleString()}`);
    });

    return true;
  } catch (error) {
    log.error(`Échec récupération email logs: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Étape 10: Simuler un paiement
 */
async function simulatePayment() {
  log.step('ÉTAPE 10: Simulation de paiement');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${testBookingId}/payment/card`,
      {
        cardNumber: '4111111111111111',
        cardName: 'Test User',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      },
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );

    log.success('Paiement simulé avec succès!');
    log.info(`Statut: ${response.data.message}`);
    return true;
  } catch (error) {
    log.error(`Échec paiement: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Étape 11: Récapitulatif final
 */
async function getFinalSummary() {
  log.step('ÉTAPE 11: Récapitulatif final');
  try {
    // Récupérer les stats des email logs
    const statsResponse = await axios.get(
      `${API_BASE_URL}/admin/email-logs/stats`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const stats = statsResponse.data.data;
    log.success('Statistiques des emails:');
    log.info(`  Total: ${stats.total}`);
    log.info(`  Aujourd'hui: ${stats.today}`);
    log.info(`  Par type:`);
    stats.byType.forEach(type => {
      log.info(`    - ${type.email_type}: ${type.count}`);
    });

    // Récupérer le booking final
    const bookingResponse = await axios.get(
      `${API_BASE_URL}/bookings/${testBookingId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );

    const booking = bookingResponse.data.data;
    log.success('\nDétails finaux de la réservation:');
    log.info(`  Référence: ${booking.booking_reference}`);
    log.info(`  Statut: ${booking.status}`);
    log.info(`  Prix final: ₹${booking.final_price}`);
    log.info(`  Statut paiement: ${booking.payment_status}`);

    return true;
  } catch (error) {
    log.error(`Échec récapitulatif: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
async function runTests() {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('TEST COMPLET DU SYSTÈME QUOTE REVIEW & PAYMENT');
  console.log('='.repeat(80));
  console.log('\n');

  let success = true;

  // Exécuter tous les tests
  if (!await loginAsAdmin()) success = false;
  if (!await loginAsUser()) success = false;
  if (!await createTestBooking()) success = false;
  if (!await getBookingDetails()) success = false;
  if (!await createInitialRevision()) success = false;
  if (!await validateVehicles()) success = false;
  if (!await validateAddons()) success = false;
  if (!await sendQuote()) success = false;
  if (!await checkEmailLogs()) success = false;
  if (!await simulatePayment()) success = false;
  if (!await getFinalSummary()) success = false;

  console.log('\n');
  console.log('='.repeat(80));
  if (success) {
    log.success('TOUS LES TESTS ONT RÉUSSI! 🎉');
  } else {
    log.warning('Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }
  console.log('='.repeat(80));
  console.log('\n');
}

// Exécuter les tests
runTests().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});
