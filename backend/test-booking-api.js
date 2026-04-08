const db = require('./src/config/database');

async function testBookingEnrichment() {
  try {
    console.log('\n=== TEST: Booking ID 100 ===\n');
    
    // 1. Récupérer la réservation brute
    const result = await db.query(
      'SELECT id, booking_reference, selected_vehicles, selected_addons FROM bookings WHERE id = $1',
      [100]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Booking 100 not found');
      process.exit(1);
    }
    
    const booking = result.rows[0];
    console.log('📦 Raw booking data:');
    console.log('  - ID:', booking.id);
    console.log('  - Reference:', booking.booking_reference);
    console.log('  - Selected Vehicles:', JSON.stringify(booking.selected_vehicles, null, 2));
    console.log('  - Selected Addons:', JSON.stringify(booking.selected_addons, null, 2));
    
    // 2. Enrichir les véhicules
    console.log('\n🚗 Enriching vehicles...');
    if (booking.selected_vehicles && Array.isArray(booking.selected_vehicles)) {
      for (const vehicle of booking.selected_vehicles) {
        if (vehicle.vehicle_id) {
          const vResult = await db.query(
            'SELECT id, name, capacity, base_price_inr FROM vehicles WHERE id = $1',
            [vehicle.vehicle_id]
          );
          
          if (vResult.rows.length > 0) {
            const vData = vResult.rows[0];
            console.log(`  ✅ Vehicle ID ${vehicle.vehicle_id}:`);
            console.log(`     - Name: ${vData.name}`);
            console.log(`     - Capacity: ${vData.capacity}`);
            console.log(`     - Price: ${vData.base_price_inr}`);
          } else {
            console.log(`  ❌ Vehicle ID ${vehicle.vehicle_id} not found in vehicles table`);
          }
        }
      }
    }
    
    // 3. Enrichir les addons
    console.log('\n➕ Enriching addons...');
    if (booking.selected_addons && Array.isArray(booking.selected_addons)) {
      for (const addon of booking.selected_addons) {
        if (addon.addon_id) {
          const aResult = await db.query(
            'SELECT id, name, price FROM addons WHERE id = $1',
            [addon.addon_id]
          );
          
          if (aResult.rows.length > 0) {
            const aData = aResult.rows[0];
            console.log(`  ✅ Addon ID ${addon.addon_id}:`);
            console.log(`     - Name: ${aData.name}`);
            console.log(`     - Price: ${aData.price}`);
          } else {
            console.log(`  ❌ Addon ID ${addon.addon_id} not found in addons table`);
          }
        }
      }
    }
    
    console.log('\n✅ Test completed\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testBookingEnrichment();
