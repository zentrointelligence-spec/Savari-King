const { sendEmail } = require('./mailerService');
const db = require('../db');

/**
 * Generate detailed quote email HTML template
 * @param {Object} quoteData - Quote revision data
 * @returns {string} HTML template
 */
function generateDetailedQuoteEmailHTML(quoteData) {
  const {
    booking,
    revision,
    tour,
    tier,
    user,
    pricing,
    vehicles,
    addons
  } = quoteData;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format price
  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    }
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre Devis - Ebenezer Tours</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7fa;
      padding: 20px;
      line-height: 1.6;
    }
    .email-container {
      max-width: 700px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      max-width: 180px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 35px;
    }
    .section-title {
      font-size: 20px;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e7ff;
      font-weight: 600;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background-color: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }
    .info-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      color: #1e293b;
      font-weight: 600;
    }
    .tour-highlight {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      padding: 25px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .tour-name {
      font-size: 22px;
      color: #1e293b;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .tier-badge {
      display: inline-block;
      background-color: #667eea;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .price-breakdown {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .price-row:last-child {
      border-bottom: none;
    }
    .price-label {
      color: #475569;
      font-size: 15px;
    }
    .price-value {
      color: #1e293b;
      font-weight: 600;
      font-size: 15px;
    }
    .price-total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      margin-top: 15px;
    }
    .price-total .price-row {
      border-bottom: none;
    }
    .price-total .price-label,
    .price-total .price-value {
      color: white;
      font-size: 18px;
      font-weight: 700;
    }
    .discount-tag {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 10px;
    }
    .fee-tag {
      display: inline-block;
      background-color: #f59e0b;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 10px;
    }
    .items-list {
      list-style: none;
      padding: 0;
    }
    .items-list li {
      padding: 10px;
      background-color: #f8fafc;
      margin-bottom: 8px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-name {
      color: #475569;
      font-size: 14px;
    }
    .item-details {
      color: #94a3b8;
      font-size: 12px;
      margin-left: 10px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .note-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .note-box p {
      color: #92400e;
      font-size: 14px;
      margin: 0;
    }
    .validity-info {
      background-color: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .validity-info p {
      color: #1e40af;
      font-size: 14px;
      margin: 0;
    }
    .footer {
      background-color: #1e293b;
      color: #94a3b8;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #667eea;
      text-decoration: none;
      margin: 0 15px;
    }
    .social-icons {
      margin: 15px 0;
    }
    @media only screen and (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .email-container {
        border-radius: 0;
      }
      .content {
        padding: 25px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Votre Devis Personnalisé</h1>
      <p>Merci de votre intérêt pour Ebenezer Tours</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Bonjour ${user.full_name || 'Cher voyageur'},
      </div>

      <p style="margin-bottom: 25px; color: #475569; font-size: 15px;">
        Nous sommes ravis de vous présenter votre devis personnalisé pour votre prochain voyage avec nous.
        Notre équipe a soigneusement examiné votre demande et préparé cette offre exclusive pour vous.
      </p>

      <!-- Tour Details Section -->
      <div class="section">
        <div class="section-title">📍 Détails de Votre Voyage</div>
        <div class="tour-highlight">
          <div class="tour-name">${tour.name}</div>
          <span class="tier-badge">${tier.tier_name}</span>

          <div class="info-grid" style="margin-top: 20px;">
            <div class="info-item">
              <div class="info-label">Date de départ</div>
              <div class="info-value">${formatDate(booking.travel_date)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Durée</div>
              <div class="info-value">${tour.duration_days} jours</div>
            </div>
            <div class="info-item">
              <div class="info-label">Participants</div>
              <div class="info-value">${booking.num_adults || 0} adultes ${booking.num_children > 0 ? `+ ${booking.num_children} enfants` : ''}</div>
            </div>
            <div class="info-item">
              <div class="info-label">N° de référence</div>
              <div class="info-value">${booking.booking_reference}</div>
            </div>
          </div>
        </div>
      </div>

      ${vehicles && vehicles.length > 0 ? `
      <!-- Vehicles Section -->
      <div class="section">
        <div class="section-title">🚗 Véhicules Sélectionnés</div>
        <ul class="items-list">
          ${vehicles.map(v => `
            <li>
              <span>
                <span class="item-name">${v.name}</span>
                <span class="item-details">x${v.quantity} · Capacité: ${v.capacity} personnes</span>
              </span>
              <span class="price-value">${formatPrice(v.total_price, booking.currency)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${addons && addons.length > 0 ? `
      <!-- Add-ons Section -->
      <div class="section">
        <div class="section-title">✨ Options Supplémentaires</div>
        <ul class="items-list">
          ${addons.map(a => `
            <li>
              <span>
                <span class="item-name">${a.name}</span>
                <span class="item-details">x${a.quantity}</span>
              </span>
              <span class="price-value">${formatPrice(a.total_price, booking.currency)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Pricing Section -->
      <div class="section">
        <div class="section-title">💰 Détail des Prix</div>
        <div class="price-breakdown">
          <div class="price-row">
            <span class="price-label">Forfait de base (${tier.tier_name})</span>
            <span class="price-value">${formatPrice(pricing.base_price, booking.currency)}</span>
          </div>

          ${pricing.vehicles_price > 0 ? `
          <div class="price-row">
            <span class="price-label">Véhicules</span>
            <span class="price-value">${formatPrice(pricing.vehicles_price, booking.currency)}</span>
          </div>
          ` : ''}

          ${pricing.addons_price > 0 ? `
          <div class="price-row">
            <span class="price-label">Options supplémentaires</span>
            <span class="price-value">${formatPrice(pricing.addons_price, booking.currency)}</span>
          </div>
          ` : ''}

          <div class="price-row" style="padding-top: 15px; margin-top: 10px; border-top: 2px solid #cbd5e1;">
            <span class="price-label" style="font-weight: 600;">Sous-total</span>
            <span class="price-value">${formatPrice(pricing.subtotal_price, booking.currency)}</span>
          </div>

          ${pricing.discounts && pricing.discounts.length > 0 ? pricing.discounts.map(d => `
          <div class="price-row">
            <span class="price-label">
              ${d.name}
              <span class="discount-tag">-${d.percentage || 0}%</span>
            </span>
            <span class="price-value" style="color: #10b981;">-${formatPrice(d.amount, booking.currency)}</span>
          </div>
          `).join('') : ''}

          ${pricing.additional_fees && pricing.additional_fees.length > 0 ? pricing.additional_fees.map(f => `
          <div class="price-row">
            <span class="price-label">
              ${f.name}
              <span class="fee-tag">+${f.percentage || 0}%</span>
            </span>
            <span class="price-value" style="color: #f59e0b;">+${formatPrice(f.amount, booking.currency)}</span>
          </div>
          `).join('') : ''}
        </div>

        <!-- Total Price -->
        <div class="price-total">
          <div class="price-row">
            <span class="price-label">PRIX TOTAL</span>
            <span class="price-value">${formatPrice(pricing.final_price, booking.currency)}</span>
          </div>
        </div>
      </div>

      ${revision.customer_message ? `
      <!-- Custom Message -->
      <div class="note-box">
        <p><strong>Note de notre équipe :</strong> ${revision.customer_message}</p>
      </div>
      ` : ''}

      <!-- Validity Info -->
      <div class="validity-info">
        <p><strong>⏰ Validité du devis :</strong> Cette offre est valable jusqu'au ${formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))}.
        Après cette date, les prix pourraient être sujets à modification.</p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://ebenezertours.com'}/bookings/${booking.id}" class="cta-button">
          Confirmer ma Réservation
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 25px;">
        Des questions ? Notre équipe est à votre disposition pour vous aider.<br>
        Contactez-nous à <a href="mailto:info@ebenezertours.com" style="color: #667eea;">info@ebenezertours.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px; color: #cbd5e1; font-weight: 600;">Ebenezer Tours</p>
      <p>Votre partenaire de confiance pour des voyages inoubliables</p>

      <div class="footer-links">
        <a href="${process.env.FRONTEND_URL || 'https://ebenezertours.com'}">Site Web</a>
        <a href="${process.env.FRONTEND_URL || 'https://ebenezertours.com'}/tours">Nos Tours</a>
        <a href="${process.env.FRONTEND_URL || 'https://ebenezertours.com'}/contact">Contact</a>
      </div>

      <p style="font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} Ebenezer Tours. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send detailed quote email to customer
 * @param {number} bookingId - Booking ID
 * @param {number} revisionId - Quote revision ID
 */
async function sendDetailedQuoteEmail(bookingId, revisionId) {
  try {
    // Get all necessary data
    const query = `
      SELECT
        b.*,
        t.name as tour_name,
        t.duration_days,
        t.destinations,
        pt.tier_name,
        pt.hotel_type,
        u.full_name,
        u.email,
        qr.*
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN packagetiers pt ON b.tier_id = pt.id
      JOIN users u ON b.user_id = u.id
      JOIN booking_quote_revisions qr ON qr.booking_id = b.id
      WHERE b.id = $1 AND qr.id = $2
    `;

    const result = await db.query(query, [bookingId, revisionId]);

    if (result.rows.length === 0) {
      throw new Error('Booking or revision not found');
    }

    const data = result.rows[0];

    // Prepare data for template
    const quoteData = {
      booking: {
        id: data.id,
        booking_reference: data.booking_reference,
        travel_date: data.travel_date,
        num_adults: data.num_adults,
        num_children: data.num_children,
        currency: data.currency
      },
      revision: {
        customer_message: data.customer_message,
        internal_notes: data.internal_notes
      },
      tour: {
        name: data.tour_name,
        duration_days: data.duration_days,
        destinations: data.destinations
      },
      tier: {
        tier_name: data.tier_name,
        hotel_type: data.hotel_type
      },
      user: {
        full_name: data.full_name,
        email: data.email
      },
      pricing: {
        base_price: parseFloat(data.base_price),
        vehicles_price: parseFloat(data.vehicles_price),
        addons_price: parseFloat(data.addons_price),
        subtotal_price: parseFloat(data.subtotal_price),
        discounts: data.discounts || [],
        total_discounts: parseFloat(data.total_discounts || 0),
        additional_fees: data.additional_fees || [],
        total_fees: parseFloat(data.total_fees || 0),
        final_price: parseFloat(data.final_price)
      },
      vehicles: data.vehicles_adjusted || data.vehicles_original || [],
      addons: data.addons_adjusted || data.addons_original || []
    };

    // Generate HTML
    const htmlContent = generateDetailedQuoteEmailHTML(quoteData);

    // Send email
    await sendEmail(
      data.email,
      `Votre Devis Personnalisé - ${data.tour_name} | Ebenezer Tours`,
      htmlContent
    );

    console.log(`Detailed quote email sent successfully to ${data.email}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending detailed quote email:', error);
    throw error;
  }
}

/**
 * Send quote approval notification to admin
 * @param {number} bookingId - Booking ID
 */
async function sendQuoteApprovalNotificationToAdmin(bookingId) {
  try {
    const result = await db.query(
      `SELECT b.*, u.full_name, u.email, t.name as tour_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN tours t ON b.tour_id = t.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = result.rows[0];

    const htmlContent = `
      <h2>Nouvelle réservation confirmée</h2>
      <p><strong>Client:</strong> ${booking.full_name} (${booking.email})</p>
      <p><strong>Tour:</strong> ${booking.tour_name}</p>
      <p><strong>Référence:</strong> ${booking.booking_reference}</p>
      <p><strong>Date de voyage:</strong> ${new Date(booking.travel_date).toLocaleDateString('fr-FR')}</p>
      <p><strong>Statut:</strong> ${booking.status}</p>
    `;

    // Send to admin email (configure in .env)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ebenezertours.com';
    await sendEmail(
      adminEmail,
      `Nouvelle réservation confirmée - ${booking.booking_reference}`,
      htmlContent
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
}

module.exports = {
  sendDetailedQuoteEmail,
  sendQuoteApprovalNotificationToAdmin,
  generateDetailedQuoteEmailHTML
};
