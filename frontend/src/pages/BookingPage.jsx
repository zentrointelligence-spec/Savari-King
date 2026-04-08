import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { api as API } from '../config/api';
import { AuthContext } from '../contexts/AuthContext';

// Import booking components
import TierSelector from '../components/booking/TierSelector';
import TravelDetailsForm from '../components/booking/TravelDetailsForm';
import AddonsSelector from '../components/booking/AddonsSelector';
import VehiclesSelector from '../components/booking/VehiclesSelector';
import ContactForm from '../components/booking/ContactForm';
import BookingSidebar from '../components/booking/BookingSidebar';
import ComparePackagesModal from '../components/booking/ComparePackagesModal';
import Loader from '../components/common/Loader';

/**
 * BookingPage Component
 *
 * Page principale de réservation avec nouveau design:
 * - Layout Desktop: Grid 2/3 (formulaire) - 1/3 (sidebar sticky)
 * - Layout Mobile: Formulaire complet + bottom bar sticky
 * - Sélection de tier intégrée (pas de param URL)
 * - Calcul de prix en temps réel
 * - Changement de tier sans rechargement
 */
const BookingPage = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, token } = useContext(AuthContext);
  const isAuthenticated = !!user && !!token;

  // État principal
  const [loading, setLoading] = useState(true);
  const [tour, setTour] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [addons, setAddons] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // État du formulaire
  const [selectedTier, setSelectedTier] = useState(null);
  const [formData, setFormData] = useState({
    travel_date: null,
    num_participants: 0,
    participant_ages: [], // Array of age category objects
    selected_addons: {}, // Changed from array to object {addonId: quantity}
    selected_vehicles: [],
    full_name: '',
    email: '',
    phone: '',
    country: '',
    special_requests: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Charger les données du tour
  useEffect(() => {
    // Clear any existing toasts when entering the booking page
    toast.dismiss();

    const fetchTourData = async () => {
      try {
        setLoading(true);

        // Récupérer les détails du tour avec tiers
        const tourResponse = await API.get(`/api/tours/${tourId}`);
        setTour(tourResponse.data);
        setTiers(tourResponse.data.tiers || []);

        // Vérifier si un tier est spécifié dans l'URL (?tier=X)
        const tierIdFromUrl = searchParams.get('tier');
        const availableTiers = tourResponse.data.tiers || [];

        let tierToSelect = null;

        if (tierIdFromUrl) {
          // Chercher le tier correspondant à l'ID dans l'URL
          tierToSelect = availableTiers.find(
            tier => tier.id === parseInt(tierIdFromUrl)
          );

          if (tierToSelect) {
            console.log(`Tier pré-sélectionné depuis URL: ${tierToSelect.tier_name || tierToSelect.name}`);
          }
        }

        // Si aucun tier trouvé dans l'URL ou tier invalide, sélectionner le premier par défaut (Standard)
        if (!tierToSelect) {
          const sortedTiers = [...availableTiers].sort((a, b) => a.price - b.price);
          if (sortedTiers.length > 0) {
            tierToSelect = sortedTiers[0];
            console.log(`Tier par défaut sélectionné: ${tierToSelect.tier_name || tierToSelect.name}`);
          }
        }

        if (tierToSelect) {
          setSelectedTier(tierToSelect);
        }

        // Récupérer les add-ons disponibles pour ce tour
        try {
          const addonsResponse = await API.get(`/api/tours/${tourId}/addons`);
          setAddons(addonsResponse.data.addons || []);
        } catch (err) {
          console.log('No addons available for this tour');
          setAddons([]);
        }

        // Récupérer les véhicules disponibles
        try {
          const vehiclesResponse = await API.get(`/api/tours/${tourId}/vehicles`);
          setVehicles(vehiclesResponse.data.optionalVehicles || []);
        } catch (err) {
          console.log('No vehicles available for this tour');
          setVehicles([]);
        }
      } catch (error) {
        console.error('Error fetching tour data:', error);
        toast.error(t('errors.failedToLoadTour'));
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (tourId) {
      fetchTourData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, searchParams]);

  // Calcul du prix en temps réel
  const calculatedPrice = useMemo(() => {
    if (!selectedTier) {
      return { base: 0, addons: 0, vehicles: 0, total: 0 };
    }

    // Prix de base (tier price × nombre de participants)
    const totalParticipants = formData.num_participants || 0;
    const basePrice = parseFloat(selectedTier.price || 0) * totalParticipants;

    // Prix des add-ons sélectionnés (avec support per-person vs fixed)
    const addonsPrice = addons.reduce((sum, addon) => {
      const quantity = formData.selected_addons[addon.id] || 0;
      const price = parseFloat(addon.price || 0);
      const pricePerPerson = addon.price_per_person !== false; // Default to true

      if (pricePerPerson && totalParticipants > 0) {
        // Per person: price × quantity × participants
        return sum + (price * quantity * totalParticipants);
      } else {
        // Fixed: price × quantity only
        return sum + (price * quantity);
      }
    }, 0);

    // Prix des véhicules (basePriceINR × duration × quantity)
    const vehiclesPrice = formData.selected_vehicles.reduce((sum, selectedVehicle) => {
      const vehicle = vehicles.find(v => v.id === selectedVehicle.vehicle_id);
      if (vehicle) {
        // vehicle.totalPrice already includes duration calculation (base_price_inr × duration_days)
        return sum + (parseFloat(vehicle.totalPrice || 0) * selectedVehicle.quantity);
      }
      return sum;
    }, 0);

    const total = basePrice + addonsPrice + vehiclesPrice;

    return {
      base: basePrice,
      addons: addonsPrice,
      vehicles: vehiclesPrice,
      total
    };
  }, [selectedTier, formData, addons, vehicles]);

  // Gérer le changement de tier
  const handleTierChange = (newTier) => {
    setSelectedTier(newTier);
  };

  // Gérer le changement de champ de formulaire
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Date de voyage (minimum +5 jours)
    if (!formData.travel_date) {
      newErrors.travel_date = t('validation.travelDateRequired');
    } else {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 5);
      if (formData.travel_date < minDate) {
        newErrors.travel_date = t('validation.travelDateTooSoon');
      }
    }

    // Nombre de participants
    if (!formData.num_participants || formData.num_participants < 1) {
      newErrors.num_participants = t('validation.participantsRequired');
    }

    // Validation que tous les âges ont été saisis
    const participantAges = formData.participant_ages || [];
    if (formData.num_participants > 0 && participantAges.length !== formData.num_participants) {
      newErrors.participant_ages = t('validation.allAgesRequired', {
        entered: participantAges.length,
        required: formData.num_participants
      });
    }

    // Validation qu'il y a au moins un adulte (18+)
    if (participantAges.length > 0) {
      const numAdults = participantAges.filter(age => age.min >= 18).length;
      if (numAdults === 0) {
        newErrors.participant_ages = t('validation.atLeastOneAdultRequired') || 'At least one adult (18+) is required for booking';
      }
    }

    // Validation que tous les âges respectent le min_age du tour
    const minAge = tour?.min_age || 0;
    if (minAge > 0 && participantAges.length > 0) {
      const invalidAges = participantAges.filter(age => age.max < minAge);
      if (invalidAges.length > 0) {
        newErrors.participant_ages = t('validation.agesbelowMinimum', { minAge });
      }
    }

    // Informations de contact
    if (!formData.full_name || formData.full_name.trim() === '') {
      newErrors.full_name = t('validation.nameRequired');
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }

    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = t('validation.phoneRequired');
    }

    if (!formData.country || formData.country.trim() === '') {
      newErrors.country = t('validation.countryRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Le formulaire est-il valide?
  const isFormValid = useMemo(() => {
    const participantAges = formData.participant_ages || [];
    return (
      formData.travel_date &&
      formData.num_participants >= 1 &&
      participantAges.length === formData.num_participants &&
      formData.full_name &&
      formData.email &&
      formData.phone &&
      formData.country &&
      selectedTier
    );
  }, [formData, selectedTier]);

  // Soumettre la réservation
  const handleSubmit = async () => {
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      toast.error(t('auth.loginRequired') || 'Please login to make a booking');
      navigate('/login', { state: { from: `/booking/${tourId}` } });
      return;
    }

    // CRITICAL CHECK: Verify at least one adult is present
    const participantAges = formData.participant_ages || [];
    const numAdults = participantAges.filter(age => age.min >= 18).length;

    if (participantAges.length > 0 && numAdults === 0) {
      toast.error(
        t('validation.noAdultInBooking') ||
        '⚠️ No Adult Participant - At least one adult (18 years or older) must participate in this booking for legal and safety reasons.',
        {
          autoClose: 8000, // Display for 8 seconds
          position: 'top-center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }
      );

      // Scroll to the participants section
      const participantsSection = document.querySelector('[class*="TravelDetailsForm"]');
      if (participantsSection) {
        participantsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return;
    }

    if (!validateForm()) {
      toast.error(t('errors.pleaseFillAllFields'));
      return;
    }

    try {
      setIsSubmitting(true);

      // Préparer les données de réservation
      // Transform selected_addons from {addonId: quantity} to [{addon_id, quantity}]
      const selectedAddonsArray = Object.entries(formData.selected_addons).map(([addonId, quantity]) => ({
        addon_id: parseInt(addonId),
        quantity: quantity
      }));

      // Calculate num_adults and num_children from participant_ages
      const participantAges = formData.participant_ages || [];
      const numAdults = participantAges.filter(age => age.min >= 18).length;
      const numChildren = participantAges.filter(age => age.min < 18).length;

      const bookingData = {
        tour_id: parseInt(tourId),
        tier_id: selectedTier.id,
        travel_date: formData.travel_date.toISOString().split('T')[0],
        num_adults: numAdults,
        num_children: numChildren,
        participant_ages: participantAges, // Send detailed age info
        selected_addons: selectedAddonsArray,
        selected_vehicles: formData.selected_vehicles,
        contact_name: formData.full_name,
        contact_email: formData.email,
        contact_phone: formData.phone,
        contact_country: formData.country, // Added back for statistics
        special_requests: formData.special_requests,
        estimated_price: calculatedPrice.total
      };

      console.log('📤 Sending booking data:', bookingData);

      // Envoyer la requête
      const response = await API.post('/api/bookings', bookingData);

      console.log('✅ Booking response:', response.data);

      // Succès
      toast.success(t('booking.inquirySubmittedSuccess'));

      // Rediriger vers la page de confirmation
      // Backend returns {success: true, data: {id, booking_reference, ...}}
      const bookingId = response.data.data?.id || response.data.booking?.id;
      if (bookingId) {
        navigate(`/booking-confirmation/${bookingId}`);
      } else {
        console.error('❌ No booking ID found in response');
        toast.error('Booking created but unable to retrieve booking ID');
      }
    } catch (error) {
      console.error('❌ Error submitting booking:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });

      // Display detailed error message
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('errors.submissionFailed');
      const errorDetails = error.response?.data?.details || '';

      toast.error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher le loader pendant le chargement
  if (loading) {
    return <Loader />;
  }

  // Afficher une erreur si le tour n'existe pas
  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {t('errors.tourNotFound')}
        </h1>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t('common.backToHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-32 lg:pb-8">
      <div className="container mx-auto px-4">
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/tours/${tourId}`)}
            className="flex items-center text-primary hover:text-primary-dark transition-colors mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('common.back')}
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {t('booking.bookYourTour')}
            </h1>
            <p className="text-lg text-gray-600">
              {tour.name}
            </p>
          </motion.div>
        </div>

        {/* Authentication Warning */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-start gap-3"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-amber-600 text-xl mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">
                {t('auth.loginRequired') || 'Login Required'}
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                {t('auth.loginToBook') || 'You need to be logged in to make a booking. Please login or create an account.'}
              </p>
              <button
                onClick={() => navigate('/login', { state: { from: `/booking/${tourId}` } })}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                {t('auth.login') || 'Login / Register'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Layout principal: Grid 2/3 - 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche: Formulaire (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Sélection du package */}
            <TierSelector
              tiers={tiers}
              selectedTier={selectedTier}
              onTierChange={handleTierChange}
            />

            {/* Section 2: Détails du voyage */}
            <TravelDetailsForm
              formData={formData}
              onChange={handleFormChange}
              errors={errors}
              tour={tour}
            />

            {/* Section 3: Add-ons (si disponibles) */}
            {addons.length > 0 && (() => {
              const participantAges = formData.participant_ages || [];
              const numAdults = participantAges.filter(age => age.min >= 18).length;
              const numChildren = participantAges.filter(age => age.min < 18).length;

              return (
                <AddonsSelector
                  addons={addons}
                  selectedAddons={formData.selected_addons}
                  onChange={(newSelection) => handleFormChange('selected_addons', newSelection)}
                  numAdults={numAdults}
                  numChildren={numChildren}
                />
              );
            })()}

            {/* Section 4: Véhicules (si disponibles) */}
            {vehicles.length > 0 && (
              <VehiclesSelector
                vehicles={vehicles}
                selectedVehicles={formData.selected_vehicles}
                onChange={(newSelection) => handleFormChange('selected_vehicles', newSelection)}
                numParticipants={formData.num_participants}
              />
            )}

            {/* Section 5: Informations de contact */}
            <ContactForm
              formData={formData}
              onChange={handleFormChange}
              errors={errors}
            />
          </div>

          {/* Colonne droite: Sidebar sticky (1/3) */}
          <div className="lg:col-span-1">
            <BookingSidebar
              tour={tour}
              selectedTier={selectedTier}
              formData={formData}
              calculatedPrice={calculatedPrice}
              onSubmit={handleSubmit}
              isFormValid={isFormValid}
              onCompare={() => setShowCompareModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Modal de comparaison */}
      <ComparePackagesModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        tiers={tiers}
        selectedTier={selectedTier}
        onSelectTier={handleTierChange}
      />

      {/* Loader pendant la soumission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center">
            <Loader />
            <p className="mt-4 text-gray-700 font-medium">
              {t('booking.submittingInquiry')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
