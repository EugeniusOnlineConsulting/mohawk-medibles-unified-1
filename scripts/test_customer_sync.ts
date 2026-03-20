import { fetchCustomers } from '../lib/wc-api';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

async function test() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Fetching first page of customers...');
  const { customers, total, totalPages } = await fetchCustomers({ page: 1, perPage: 100 });
  console.log('Total customers in WC:', total, '| Pages:', totalPages);

  let success = 0;
  for (const wc of customers) {
    try {
      if (!wc.email) continue;
      const name = [wc.first_name, wc.last_name].filter(Boolean).join(' ') || wc.email;
      await prisma.user.upsert({
        where: { wcCustomerId: wc.id },
        create: { wcCustomerId: wc.id, email: wc.email, passwordHash: '', name, phone: wc.billing?.phone || null, username: wc.username || null, ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0 },
        update: { name, ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0 },
      });
      success++;
    } catch (err: any) { console.error('  Skip:', wc.email, err.message?.slice(0, 100)); }
  }
  console.log('Customers synced (page 1):', success + '/100');

  const count = await prisma.user.count();
  const productCount = await prisma.product.count();
  console.log('Total users in DB:', count);
  console.log('Total products in DB:', productCount);
  await prisma.$disconnect();
  await pool.end();
}
test().catch(console.error);
