/**
 * Script de test pour le système d'avis complet
 * Teste les avis sur les tours, destinations et addons
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration
const TEST_CONFIG = {
  // Remplacez par vos propres identifiants de test
  email: 'test@example.com',
  password: 'test123',
};

let authToken = null;
let testBookingId = null;

// Fonction pour se connecter
async function login() {
  try {
    console.log('\n🔐 Connexion...');
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email: TEST_CONFIG.email,
      password: TEST_CONFIG.password,
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Connexion réussie!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    return false;
  }
}

// Fonction pour trouver une réservation complétée
async function findCompletedBooking() {
  try {
    console.log('\n🔍 Recherche d\'une réservation complétée...');
    const response = await axios.get(`${API_BASE_URL}/bookings/user`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data) {
      const completedBookings = response.data.data.filter(
        (b) => b.status === 'Trip Completed'
      );

      if (completedBookings.length > 0) {
        testBookingId = completedBookings[0].id;
        console.log(`✅ Réservation complétée trouvée: ID ${testBookingId}`);
        console.log(`   Tour: ${completedBookings[0].tour_name}`);
        console.log(`   Référence: ${completedBookings[0].booking_reference}`);
        return true;
      } else {
        console.log('⚠️  Aucune réservation complétée trouvée');
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

// Fonction pour récupérer les détails de réservation pour les avis
async function getBookingReviewDetails() {
  try {
    console.log('\n📋 Récupération des détails pour les avis...');
    const response = await axios.get(
      `${API_BASE_URL}/booking-reviews/${testBookingId}/details`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      console.log('✅ Détails récupérés avec succès!');
      console.log('\n📊 Informations de la réservation:');
      console.log(`   Tour: ${response.data.data.booking.tour.name}`);

      if (response.data.data.booking.destination) {
        console.log(`   Destination: ${response.data.data.booking.destination.name}`);
      }

      if (response.data.data.booking.addons && response.data.data.booking.addons.length > 0) {
        console.log(`   Addons: ${response.data.data.booking.addons.length} addon(s)`);
        response.data.data.booking.addons.forEach((addon, idx) => {
          console.log(`     ${idx + 1}. ${addon.name} (${addon.category})`);
        });
      }

      console.log('\n📝 Avis existants:');
      console.log(`   Tour déjà évalué: ${response.data.data.existingReviews.tourReviewed ? 'Oui' : 'Non'}`);
      console.log(`   Destination déjà évaluée: ${response.data.data.existingReviews.destinationReviewed ? 'Oui' : 'Non'}`);
      console.log(`   Addons déjà évalués: ${response.data.data.existingReviews.addonReviews.length}`);

      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
}

// Fonction pour soumettre des avis
async function submitReviews(bookingData) {
  try {
    console.log('\n✍️  Soumission des avis...');

    const payload = {
      tourReview: bookingData.existingReviews.tourReviewed
        ? null
        : {
            rating: 5,
            comment: 'Excellent tour! Je recommande vivement.',
            would_recommend: true,
            travel_date: bookingData.booking.travel_date,
          },
      destinationReview:
        bookingData.booking.destination && !bookingData.existingReviews.destinationReviewed
          ? {
              rating: 5,
              comment: 'Magnifique destination, à voir absolument!',
            }
          : null,
      addonReviews:
        bookingData.booking.addons && bookingData.booking.addons.length > 0
          ? bookingData.booking.addons.map((addon) => ({
              addon_id: addon.id,
              rating: 4,
              comment: `Très bon addon: ${addon.name}`,
            }))
          : [],
    };

    const response = await axios.post(
      `${API_BASE_URL}/booking-reviews/${testBookingId}/submit`,
      payload,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      console.log('✅ Avis soumis avec succès!');
      console.log('\n📊 Résultats:');

      if (response.data.data.tourReview) {
        if (response.data.data.tourReview.alreadyExists) {
          console.log('   Tour: Avis déjà existant');
        } else {
          console.log(`   Tour: Avis créé (ID: ${response.data.data.tourReview.id})`);
        }
      }

      if (response.data.data.destinationReview) {
        if (response.data.data.destinationReview.alreadyExists) {
          console.log('   Destination: Avis déjà existant');
        } else {
          console.log(`   Destination: Avis créé (ID: ${response.data.data.destinationReview.id})`);
        }
      }

      if (response.data.data.addonReviews.length > 0) {
        console.log(`   Addons: ${response.data.data.addonReviews.length} avis créés`);
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

// Fonction pour vérifier si l'utilisateur peut laisser un avis
async function canReviewBooking() {
  try {
    console.log('\n🔍 Vérification de l\'éligibilité pour laisser un avis...');
    const response = await axios.get(
      `${API_BASE_URL}/booking-reviews/${testBookingId}/can-review`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      console.log('✅ Vérification réussie!');
      console.log(`   Status: ${response.data.data.status}`);
      console.log(`   Peut laisser un avis: ${response.data.data.can_review ? 'Oui' : 'Non'}`);
      return response.data.data.can_review;
    }
    return false;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  TEST DU SYSTÈME D\'AVIS COMPLET                           ║');
  console.log('║  Tours, Destinations & Addons                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // 1. Connexion
  if (!(await login())) {
    console.log('\n❌ Test arrêté: Impossible de se connecter');
    console.log('💡 Créez un utilisateur de test avec ces identifiants:');
    console.log(`   Email: ${TEST_CONFIG.email}`);
    console.log(`   Password: ${TEST_CONFIG.password}`);
    return;
  }

  // 2. Trouver une réservation complétée
  if (!(await findCompletedBooking())) {
    console.log('\n❌ Test arrêté: Aucune réservation complétée trouvée');
    console.log('💡 Créez une réservation avec le statut "Trip Completed" pour tester');
    return;
  }

  // 3. Vérifier l'éligibilité
  const canReview = await canReviewBooking();
  if (!canReview) {
    console.log('\n❌ Test arrêté: L\'utilisateur ne peut pas laisser d\'avis');
    return;
  }

  // 4. Récupérer les détails
  const bookingData = await getBookingReviewDetails();
  if (!bookingData) {
    console.log('\n❌ Test arrêté: Impossible de récupérer les détails');
    return;
  }

  // 5. Soumettre les avis
  await submitReviews(bookingData);

  // 6. Vérifier à nouveau pour voir les avis existants
  console.log('\n🔄 Vérification des avis après soumission...');
  await getBookingReviewDetails();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ TESTS TERMINÉS                                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Exécuter les tests
runTests().catch((error) => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
