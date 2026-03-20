import { fetchOrders } from '../lib/wc-api';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const STATUS_MAP: Record<string, string> = {
  'pending': 'PENDING', 'processing': 'PROCESSING', 'on-hold': 'ON_HOLD',
  'completed': 'COMPLETED', 'cancelled': 'CANCELLED', 'refunded': 'REFUNDED', 'failed': 'FAILED', 'trash': 'CANCELLED',
};
const PAY_MAP: Record<string, string> = {
  'completed': 'PAID', 'processing': 'PAID', 'refunded': 'REFUNDED', 'failed': 'FAILED',
};

async function run() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('[Order Sync] Starting full sync...');
  const start = Date.now();

  // Get total
  const first = await fetchOrders({ page: 1 });
  console.log(`[Order Sync] Total orders: ${first.total} | Pages: ${first.totalPages}`);

  let totalSuccess = 0, totalFail = 0;

  async function syncPage(orders: any[]) {
    for (const wc of orders) {
      try {
        let userId: string;
        if (wc.customer_id > 0) {
          const user = await prisma.user.findUnique({ where: { wcCustomerId: wc.customer_id } });
          if (user) { userId = user.id; }
          else {
            const email = wc.billing?.email || `guest-${wc.customer_id}@mohawkmedibles.ca`;
            const name = [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest';
            const created = await prisma.user.upsert({
              where: { email },
              create: { wcCustomerId: wc.customer_id, email, passwordHash: '', name },
              update: { wcCustomerId: wc.customer_id },
            });
            userId = created.id;
          }
        } else {
          const email = wc.billing?.email || `guest-order-${wc.id}@mohawkmedibles.ca`;
          const name = [wc.billing?.first_name, wc.billing?.last_name].filter(Boolean).join(' ') || 'Guest';
          const guest = await prisma.user.upsert({
            where: { email },
            create: { email, passwordHash: '', name },
            update: {},
          });
          userId = guest.id;
        }

        const subtotal = wc.line_items?.reduce((s: number, i: any) => s + parseFloat(i.total || '0'), 0) || 0;

        await prisma.order.upsert({
          where: { wcOrderId: wc.id },
          create: {
            wcOrderId: wc.id, wcOrderKey: wc.order_key, orderNumber: `MM-${wc.id}`,
            userId, status: (STATUS_MAP[wc.status] || 'PENDING') as any,
            subtotal, shippingCost: parseFloat(wc.shipping_total) || 0,
            tax: parseFloat(wc.total_tax) || 0, discount: parseFloat(wc.discount_total) || 0,
            total: parseFloat(wc.total) || 0, currency: wc.currency || 'CAD',
            paymentMethod: wc.payment_method || null, paymentMethodTitle: wc.payment_method_title || null,
            paymentReference: wc.transaction_id || null,
            paymentStatus: (PAY_MAP[wc.status] || 'PENDING') as any,
            customerNote: wc.customer_note || null, ipAddress: wc.customer_ip_address || null,
            billingData: JSON.stringify(wc.billing), shippingData: JSON.stringify(wc.shipping),
            createdAt: new Date(wc.date_created),
          },
          update: {
            status: (STATUS_MAP[wc.status] || 'PENDING') as any,
            paymentStatus: (PAY_MAP[wc.status] || 'PENDING') as any,
            total: parseFloat(wc.total) || 0,
            paymentReference: wc.transaction_id || null,
          },
        });
        totalSuccess++;
      } catch (err: any) {
        totalFail++;
        if (totalFail <= 10) console.error(`  Order ${wc.id} fail:`, err.message?.slice(0, 120));
      }
    }
  }

  // Process first page
  await syncPage(first.orders);
  console.log(`  Page 1/${first.totalPages} — ${totalSuccess} synced`);

  // Process remaining
  for (let page = 2; page <= first.totalPages; page++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const result = await fetchOrders({ page });
      await syncPage(result.orders);
      if (page % 10 === 0 || page === first.totalPages) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(0);
        console.log(`  Page ${page}/${first.totalPages} — ${totalSuccess} synced, ${totalFail} failed (${elapsed}s)`);
      }
    } catch (err: any) {
      console.error(`  Page ${page} FETCH failed:`, err.message?.slice(0, 100));
      totalFail += 100;
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const orderCount = await prisma.order.count();
  const userCount = await prisma.user.count();
  console.log(`\n[Order Sync] COMPLETE in ${elapsed}s`);
  console.log(`  Synced: ${totalSuccess} | Failed: ${totalFail}`);
  console.log(`  Total orders in DB: ${orderCount}`);
  console.log(`  Total users in DB: ${userCount} (includes guests created during order sync)`);

  await prisma.$disconnect();
  await pool.end();
}
run().catch(e => { console.error('FATAL:', e); process.exit(1); });
