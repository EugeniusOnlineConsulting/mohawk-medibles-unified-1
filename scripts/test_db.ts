import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

async function test() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // 1. Count all tables
  const products = await prisma.product.count();
  const users = await prisma.user.count();
  const orders = await prisma.order.count();
  const orderItems = await prisma.orderItem.count();
  const addresses = await prisma.address.count();
  const specs = await prisma.productSpec.count();
  const images = await prisma.productImage.count();
  const inventory = await prisma.inventory.count();

  console.log('=== DATABASE STATUS ===');
  console.log(`Products:     ${products}`);
  console.log(`Users:        ${users}`);
  console.log(`Orders:       ${orders}`);
  console.log(`Order Items:  ${orderItems}`);
  console.log(`Addresses:    ${addresses}`);
  console.log(`Product Specs: ${specs}`);
  console.log(`Product Images: ${images}`);
  console.log(`Inventory:    ${inventory}`);

  // 2. Sample product with specs
  const sampleProduct = await prisma.product.findFirst({
    where: { status: 'ACTIVE' },
    include: { specs: true, inventory: true, images: { take: 2 } },
  });
  console.log('\n=== SAMPLE PRODUCT ===');
  console.log(`Name: ${sampleProduct?.name}`);
  console.log(`Price: $${sampleProduct?.price}`);
  console.log(`Category: ${sampleProduct?.category}`);
  console.log(`THC: ${sampleProduct?.specs?.thc || 'N/A'}`);
  console.log(`Stock: ${sampleProduct?.inventory?.quantity ?? 'N/A'}`);
  console.log(`Images: ${sampleProduct?.images?.length}`);

  // 3. Sample order with user
  const sampleOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });
  console.log('\n=== LATEST ORDER ===');
  console.log(`Order: ${sampleOrder?.orderNumber}`);
  console.log(`Status: ${sampleOrder?.status}`);
  console.log(`Total: $${sampleOrder?.total} ${sampleOrder?.currency}`);
  console.log(`Payment: ${sampleOrder?.paymentMethodTitle || sampleOrder?.paymentMethod}`);
  console.log(`Customer: ${sampleOrder?.user?.name} (WC#${sampleOrder?.user?.wcCustomerId})`);
  console.log(`Date: ${sampleOrder?.createdAt}`);

  // 4. Order status distribution
  const statusCounts = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
    orderBy: { _count: { status: 'desc' } },
  });
  console.log('\n=== ORDER STATUS BREAKDOWN ===');
  for (const s of statusCounts) {
    console.log(`  ${s.status}: ${s._count}`);
  }

  // 5. Payment method distribution
  const paymentCounts = await prisma.order.groupBy({
    by: ['paymentMethod'],
    _count: true,
    orderBy: { _count: { paymentMethod: 'desc' } },
    take: 10,
  });
  console.log('\n=== PAYMENT METHODS ===');
  for (const p of paymentCounts) {
    console.log(`  ${p.paymentMethod || 'unknown'}: ${p._count}`);
  }

  // 6. Top customers by total spent
  const topCustomers = await prisma.user.findMany({
    where: { totalSpent: { gt: 0 } },
    orderBy: { totalSpent: 'desc' },
    take: 5,
    select: { name: true, ordersCount: true, totalSpent: true },
  });
  console.log('\n=== TOP 5 CUSTOMERS (by spend) ===');
  for (const c of topCustomers) {
    console.log(`  ${c.name}: $${c.totalSpent.toFixed(2)} (${c.ordersCount} orders)`);
  }

  // 7. Product categories
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });
  console.log('\n=== PRODUCT CATEGORIES ===');
  for (const c of categories) {
    console.log(`  ${c.category}: ${c._count}`);
  }

  console.log('\n=== ALL TESTS PASSED ===');
  await prisma.$disconnect();
  await pool.end();
}
test().catch(e => { console.error('TEST FAILED:', e); process.exit(1); });
