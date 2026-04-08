/**
 * Booking PDF Service
 * Generates payment receipt PDFs for confirmed bookings
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../db');

class BookingPdfService {
  /**
   * Generate sequential receipt number
   * Format: RECEIPT-2025-00001
   */
  async generateReceiptNumber() {
    const year = new Date().getFullYear();

    // Get the latest receipt number for this year
    const result = await db.query(
      `SELECT receipt_number FROM bookings
       WHERE receipt_number LIKE $1
       ORDER BY receipt_number DESC
       LIMIT 1`,
      [`RECEIPT-${year}-%`]
    );

    let sequenceNumber = 1;
    if (result.rows.length > 0) {
      const lastNumber = result.rows[0].receipt_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }

    return `RECEIPT-${year}-${sequenceNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Fetch complete booking data with all details
   */
  async fetchBookingData(bookingId) {
    const query = `
      SELECT
        b.*,
        t.name as tour_name,
        t.duration_days,
        t.destinations,
        pt.tier_name,
        u.full_name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      LEFT JOIN packagetiers pt ON b.tier_id = pt.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `;

    const result = await db.query(query, [bookingId]);
    if (result.rows.length === 0) {
      throw new Error(`Booking #${bookingId} not found`);
    }

    return result.rows[0];
  }

  /**
   * Get latest accepted revision for pricing details
   */
  async getAcceptedRevision(bookingId) {
    const query = `
      SELECT * FROM booking_quote_revisions
      WHERE booking_id = $1 AND accepted_at IS NOT NULL
      ORDER BY accepted_at DESC
      LIMIT 1
    `;

    const result = await db.query(query, [bookingId]);
    return result.rows[0] || null;
  }

  /**
   * Enrich vehicle data with names and details from vehicles table
   */
  async enrichVehicleData(selectedVehicles) {
    if (!selectedVehicles || selectedVehicles.length === 0) {
      return [];
    }

    const vehicleIds = selectedVehicles.map(v => v.vehicle_id || v.id).filter(Boolean);
    if (vehicleIds.length === 0) {
      return selectedVehicles;
    }

    const query = `
      SELECT id, name, capacity, price_per_day
      FROM vehicles
      WHERE id = ANY($1)
    `;

    const result = await db.query(query, [vehicleIds]);
    const vehiclesMap = {};
    result.rows.forEach(v => {
      vehiclesMap[v.id] = v;
    });

    return selectedVehicles.map(sv => {
      const vehicleData = vehiclesMap[sv.vehicle_id || sv.id];
      return {
        ...sv,
        name: vehicleData ? `${vehicleData.name} (${vehicleData.capacity} seats)` : 'Unknown Vehicle',
        price: sv.price || (vehicleData ? vehicleData.price_per_day : 0)
      };
    });
  }

  /**
   * Enrich addon data with names and details from addons table
   */
  async enrichAddonData(selectedAddons) {
    if (!selectedAddons || selectedAddons.length === 0) {
      return [];
    }

    const addonIds = selectedAddons.map(a => a.addon_id || a.id).filter(Boolean);
    if (addonIds.length === 0) {
      return selectedAddons;
    }

    const query = `
      SELECT id, name, price, price_per_person
      FROM addons
      WHERE id = ANY($1)
    `;

    const result = await db.query(query, [addonIds]);
    const addonsMap = {};
    result.rows.forEach(a => {
      addonsMap[a.id] = a;
    });

    return selectedAddons.map(sa => {
      const addonData = addonsMap[sa.addon_id || sa.id];
      return {
        ...sa,
        name: addonData ? addonData.name : 'Unknown Add-on',
        price: sa.price || (addonData ? addonData.price : 0),
        price_per_person: sa.price_per_person !== undefined ? sa.price_per_person : (addonData ? addonData.price_per_person : false)
      };
    });
  }

  /**
   * Convert INR to USD (using approximate rate - should use real rate in production)
   */
  convertToUSD(amountINR) {
    const exchangeRate = 0.012; // 1 INR = ~0.012 USD (update with real rate)
    return (amountINR * exchangeRate).toFixed(2);
  }

  /**
   * Format currency in USD
   */
  formatUSD(amount) {
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Generate Payment Receipt PDF
   */
  async generatePaymentReceiptPdf(bookingId) {
    try {
      console.log(`📄 Generating payment receipt PDF for booking #${bookingId}`);

      // Fetch data
      console.log('📄 Step 1: Fetching booking data...');
      const booking = await this.fetchBookingData(bookingId);
      console.log('📄 Step 2: Booking data fetched successfully');

      const revision = await this.getAcceptedRevision(bookingId);
      console.log('📄 Step 3: Revision data fetched');

      // Enrich vehicle and addon data with names and prices from database
      console.log('📄 Step 3a: Enriching vehicle data...');
      booking.selected_vehicles = await this.enrichVehicleData(booking.selected_vehicles);
      console.log('📄 Step 3b: Enriching addon data...');
      booking.selected_addons = await this.enrichAddonData(booking.selected_addons);
      console.log('📄 Step 3c: Data enrichment complete');

      // Generate receipt number if not exists
      let receiptNumber = booking.receipt_number;
      if (!receiptNumber) {
        receiptNumber = await this.generateReceiptNumber();

        // Update database with receipt number
        await db.query(
          'UPDATE bookings SET receipt_number = $1 WHERE id = $2',
          [receiptNumber, bookingId]
        );
      }

      // Create PDF directory if not exists
      const pdfDir = path.join(__dirname, '../../public/payment-receipts');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Generate PDF filename
      const filename = `payment-receipt-${booking.booking_reference}-${Date.now()}.pdf`;
      const filepath = path.join(pdfDir, filename);
      const relativePath = `/payment-receipts/${filename}`;

      console.log('📄 Step 4: Creating PDF document...');
      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      console.log('📄 Step 5: Adding content to PDF...');
      // --- HEADER ---
      this.addHeader(doc, receiptNumber);

      doc.moveDown(1.5);

      // --- RECEIPT INFO BOX ---
      this.addReceiptInfoBox(doc, booking, receiptNumber);

      doc.moveDown(1);

      // --- CUSTOMER INFORMATION ---
      this.addSection(doc, 'CUSTOMER INFORMATION');
      const customerName = (booking.contact_name || booking.user_name || '').replace(/\n/g, ' ').trim();
      this.addKeyValue(doc, 'Name:', customerName);
      this.addKeyValue(doc, 'Email:', booking.contact_email || booking.user_email);
      this.addKeyValue(doc, 'Phone:', booking.contact_phone || booking.user_phone || 'N/A');
      this.addKeyValue(doc, 'Country:', booking.contact_country || 'N/A');

      doc.moveDown(0.7);

      // --- TOUR DETAILS ---
      this.addSection(doc, 'TOUR DETAILS');
      this.addKeyValue(doc, 'Tour Name:', booking.tour_name);
      this.addKeyValue(doc, 'Package Tier:', booking.tier_name);
      this.addKeyValue(doc, 'Duration:', `${booking.duration_days} days`);
      this.addKeyValue(doc, 'Travel Date:', new Date(booking.travel_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      if (booking.destinations) {
        this.addKeyValue(doc, 'Destinations:', booking.destinations.join(', '));
      }

      doc.moveDown(0.7);

      // --- PARTICIPANTS ---
      this.addSection(doc, 'PARTICIPANTS');
      this.addKeyValue(doc, 'Adults:', booking.num_adults || 0);
      this.addKeyValue(doc, 'Children:', booking.num_children || 0);
      this.addKeyValue(doc, 'Total Participants:', (booking.num_adults || 0) + (booking.num_children || 0));

      doc.moveDown(0.7);

      // --- VEHICLES & ADD-ONS ---
      if (booking.selected_vehicles && booking.selected_vehicles.length > 0) {
        this.addSection(doc, 'SELECTED VEHICLES');
        booking.selected_vehicles.forEach(vehicle => {
          const priceUSD = this.convertToUSD(vehicle.price || 0);
          const totalUSD = this.convertToUSD((vehicle.price || 0) * booking.duration_days * (vehicle.quantity || 1));
          this.addKeyValue(doc, `✓ ${vehicle.name}`, `${this.formatUSD(priceUSD)}/day × ${booking.duration_days} days × ${vehicle.quantity || 1} = ${this.formatUSD(totalUSD)}`);
        });
        doc.moveDown(0.5);
      }

      if (booking.selected_addons && booking.selected_addons.length > 0) {
        this.addSection(doc, 'SELECTED ADD-ONS');
        booking.selected_addons.forEach(addon => {
          const priceUSD = this.convertToUSD(addon.price || 0);
          const quantity = addon.price_per_person ? ((booking.num_adults || 0) + (booking.num_children || 0)) : (addon.quantity || 1);
          const totalUSD = this.convertToUSD((addon.price || 0) * quantity);
          const unit = addon.price_per_person ? 'person' : 'unit';
          this.addKeyValue(doc, `✓ ${addon.name}`, `${this.formatUSD(priceUSD)}/${unit} × ${quantity} = ${this.formatUSD(totalUSD)}`);
        });
        doc.moveDown(0.5);
      }

      // --- PRICING BREAKDOWN ---
      this.addSection(doc, 'PRICING BREAKDOWN');

      const basePriceUSD = this.convertToUSD(revision?.base_price || booking.estimated_price || 0);
      const vehiclesPriceUSD = this.convertToUSD(revision?.vehicles_price || 0);
      const addonsPriceUSD = this.convertToUSD(revision?.addons_price || 0);
      const subtotalUSD = this.convertToUSD(revision?.subtotal_price || booking.estimated_price || 0);
      const discountsUSD = this.convertToUSD(revision?.total_discounts || 0);
      const feesUSD = this.convertToUSD(revision?.total_fees || 0);
      const finalPriceUSD = this.convertToUSD(booking.final_price || booking.estimated_price);

      this.addPriceLine(doc, 'Base Package Price:', this.formatUSD(basePriceUSD));
      if (parseFloat(vehiclesPriceUSD) > 0) {
        this.addPriceLine(doc, 'Vehicles Total:', this.formatUSD(vehiclesPriceUSD));
      }
      if (parseFloat(addonsPriceUSD) > 0) {
        this.addPriceLine(doc, 'Add-ons Total:', this.formatUSD(addonsPriceUSD));
      }

      doc.moveDown(0.3);
      doc.moveTo(90, doc.y).lineTo(540, doc.y).stroke('#E5E7EB');
      doc.moveDown(0.5);

      this.addPriceLine(doc, 'Subtotal:', this.formatUSD(subtotalUSD), '#000000', true);

      if (parseFloat(discountsUSD) > 0) {
        this.addPriceLine(doc, 'Discounts:', `- ${this.formatUSD(discountsUSD)}`, '#10B981');
      }
      if (parseFloat(feesUSD) > 0) {
        this.addPriceLine(doc, 'Additional Fees:', `+ ${this.formatUSD(feesUSD)}`);
      }

      doc.moveDown(0.3);
      doc.moveTo(90, doc.y).lineTo(540, doc.y).lineWidth(2).stroke('#1F2937');
      doc.moveDown(0.7);

      // TOTAL PAID (large and bold)
      const totalY = doc.y;
      doc.fontSize(16).fillColor('#10B981').font('Helvetica-Bold');
      doc.text('TOTAL PAID:', 90, totalY);
      doc.fontSize(18).text(this.formatUSD(finalPriceUSD), 400, totalY, { width: 140, align: 'right' });
      doc.fillColor('#000000').font('Helvetica').fontSize(11);

      doc.moveDown(1);

      // --- PAYMENT DETAILS ---
      this.addSection(doc, 'PAYMENT DETAILS');
      this.addKeyValue(doc, 'Payment Method:', this.formatPaymentMethod(booking.payment_method));
      this.addKeyValue(doc, 'Transaction ID:', booking.payment_transaction_id || 'N/A');
      this.addKeyValue(doc, 'Payment Date:', booking.payment_timestamp ? new Date(booking.payment_timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A');
      this.addKeyValue(doc, 'Payment Status:', '✅ CONFIRMED', '#10B981');

      doc.moveDown(1);

      // --- IMPORTANT INFORMATION ---
      this.addSection(doc, 'IMPORTANT INFORMATION');
      doc.fontSize(9).fillColor('#666666');
      doc.text('• Please arrive 15 minutes before the scheduled departure time', 90);
      doc.text('• Bring valid government-issued ID proof for all participants', 90);
      doc.text('• Contact us at least 48 hours in advance for any changes to your booking', 90);
      doc.text('• Cancellation policy applies as per our Terms & Conditions', 90);
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor('#3B82F6');
      doc.text('For full Terms & Conditions, visit: https://ebenezertours.com/terms', 90, doc.y, { link: 'https://ebenezertours.com/terms', underline: true });

      doc.fillColor('#000000').fontSize(11);
      doc.moveDown(1.5);

      // --- FOOTER ---
      this.addFooter(doc);

      console.log('📄 Step 6: Finalizing PDF document...');
      // Finalize PDF
      doc.end();

      console.log('📄 Step 7: Waiting for PDF stream to finish...');
      // Wait for write to finish
      await new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log('📄 Step 8: PDF stream finished successfully');
          resolve();
        });
        stream.on('error', (err) => {
          console.error('📄 ERROR: PDF stream error:', err);
          reject(err);
        });
      });

      console.log(`✅ Payment receipt PDF generated: ${filepath}`);

      console.log('📄 Step 9: Updating database with PDF path...');
      // Update booking with PDF path
      try {
        const updateResult = await db.query(
          'UPDATE bookings SET payment_receipt_pdf = $1 WHERE id = $2 RETURNING id, payment_receipt_pdf',
          [relativePath, bookingId]
        );
        console.log('📄 Step 9a: Database update result:', updateResult.rows);
      } catch (dbError) {
        console.error('📄 ERROR at Step 9: Database update failed:', dbError);
        throw dbError;
      }

      console.log('📄 Step 10: PDF generation complete!');
      return {
        success: true,
        filepath,
        relativePath,
        receiptNumber
      };
    } catch (error) {
      console.error('Error generating payment receipt PDF:', error);
      throw error;
    }
  }

  /**
   * Add header with logo and title
   */
  addHeader(doc, receiptNumber) {
    const logoPath = path.join(__dirname, '../assets/logo.png');

    // Add logo if exists
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 70, 50, { width: 120 });
    }

    // Receipt title
    doc.fontSize(24).fillColor('#3B82F6').font('Helvetica-Bold');
    doc.text('PAYMENT RECEIPT', 200, 60, { align: 'right' });

    doc.fontSize(12).fillColor('#666666').font('Helvetica');
    doc.text(receiptNumber, 200, 90, { align: 'right' });

    doc.fillColor('#000000').fontSize(11).font('Helvetica');
  }

  /**
   * Add receipt info box
   */
  addReceiptInfoBox(doc, booking, receiptNumber) {
    const boxY = 130;

    // Draw box
    doc.rect(70, boxY, 470, 80).fillAndStroke('#F0F9FF', '#3B82F6');

    doc.fillColor('#000000').fontSize(11).font('Helvetica');
    doc.text('Booking Reference:', 90, boxY + 15);
    doc.font('Helvetica-Bold').text(booking.booking_reference, 250, boxY + 15);

    doc.font('Helvetica').text('Booking Date:', 90, boxY + 35);
    doc.font('Helvetica-Bold').text(new Date(booking.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 250, boxY + 35);

    doc.font('Helvetica').text('Status:', 90, boxY + 55);
    doc.font('Helvetica-Bold').fillColor('#10B981').text('✅ Payment Confirmed', 250, boxY + 55);

    doc.fillColor('#000000').font('Helvetica');
  }

  /**
   * Add section heading
   */
  addSection(doc, title) {
    doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold');
    doc.text(title, 70);
    doc.moveDown(0.3);
    doc.moveTo(70, doc.y).lineTo(540, doc.y).stroke('#E5E7EB');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#000000').font('Helvetica');
  }

  /**
   * Add key-value pair
   */
  addKeyValue(doc, key, value, color = '#000000') {
    doc.font('Helvetica').fillColor('#666666').text(key, 90, doc.y, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').fillColor(color).text(value, { align: 'left' });
    doc.fillColor('#000000').font('Helvetica');
  }

  /**
   * Add price line with right-aligned amount
   */
  addPriceLine(doc, label, amount, color = '#000000', bold = false) {
    const y = doc.y;
    const font = bold ? 'Helvetica-Bold' : 'Helvetica';

    doc.font(font).fillColor('#666666').text(label, 90, y);
    doc.font(font).fillColor(color).text(amount, 400, y, { width: 140, align: 'right' });
    doc.moveDown(0.5);
    doc.fillColor('#000000').font('Helvetica');
  }

  /**
   * Format payment method
   */
  formatPaymentMethod(method) {
    const methods = {
      card: 'Credit/Debit Card',
      'bank-transfer': 'Bank Transfer',
      paypal: 'PayPal'
    };
    return methods[method] || method || 'N/A';
  }

  /**
   * Add footer
   */
  addFooter(doc) {
    const currentY = doc.y;

    doc.moveTo(70, currentY).lineTo(540, currentY).stroke('#E5E7EB');
    doc.moveDown(0.5);

    doc.fontSize(9).fillColor('#1F2937').font('Helvetica-Bold');
    doc.text('EBENEZER TOURS AND TRAVELS', 70, doc.y, { align: 'center' });
    doc.fontSize(8).fillColor('#666666').font('Helvetica');
    doc.text('123 Tourist Street, Travel City, India 110001', 70, doc.y + 15, { align: 'center' });
    doc.text('Email: info@ebenezertours.com | Phone: +91 123 456 7890', 70, doc.y + 28, { align: 'center' });
    doc.text('Website: www.ebenezertours.com | GSTIN: 22AAAAA0000A1Z5', 70, doc.y + 41, { align: 'center' });

    doc.moveDown(2.5);
    doc.fontSize(9).fillColor('#3B82F6').font('Helvetica-Oblique');
    doc.text('Thank you for choosing Ebenezer Tours! We wish you a wonderful journey.', 70, doc.y, { align: 'center' });
  }
}

module.exports = new BookingPdfService();
