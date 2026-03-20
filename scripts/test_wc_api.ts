import { fetchAllProducts, fetchCustomers, fetchOrders, fetchPaymentGateways, fetchShippingZones } from '../lib/wc-api';

async function test() {
  console.log('=== WC API CLIENT TESTS ===\n');

  // Test 1: Products (Store API)
  console.log('1. Products (Store API v1)...');
  try {
    const { customers, total } = await fetchCustomers({ page: 1, perPage: 1 });
    console.log(`   OK — ${total} total customers, got 1`);
  } catch (e: any) { console.log('   FAIL:', e.message); }

  // Test 2: Orders (v3)
  console.log('2. Orders (v3 API)...');
  try {
    const { orders, total } = await fetchOrders({ page: 1, perPage: 1 });
    console.log(`   OK — ${total} total orders, latest: #${orders[0]?.id} (${orders[0]?.status})`);
  } catch (e: any) { console.log('   FAIL:', e.message); }

  // Test 3: Customers (v3)
  console.log('3. Customers (v3 API)...');
  try {
    const { customers, total } = await fetchCustomers({ page: 1, perPage: 1 });
    console.log(`   OK — ${total} total customers`);
  } catch (e: any) { console.log('   FAIL:', e.message); }

  // Test 4: Payment Gateways
  console.log('4. Payment Gateways...');
  try {
    const gateways = await fetchPaymentGateways();
    const enabled = gateways.filter(g => g.enabled);
    console.log(`   OK — ${gateways.length} gateways, ${enabled.length} enabled:`);
    for (const g of enabled) {
      console.log(`     - ${g.id}: ${g.title}`);
    }
  } catch (e: any) { console.log('   FAIL:', e.message); }

  // Test 5: Shipping Zones
  console.log('5. Shipping Zones...');
  try {
    const zones = await fetchShippingZones();
    console.log(`   OK — ${zones.length} zones:`);
    for (const z of zones) {
      console.log(`     - ${z.name}`);
    }
  } catch (e: any) { console.log('   FAIL:', e.message); }

  console.log('\n=== WC API TESTS COMPLETE ===');
}
test().catch(console.error);
