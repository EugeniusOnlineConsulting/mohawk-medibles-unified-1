import { fetchAllCustomers } from '../lib/wc-api';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

async function run() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('[Customer Sync] Starting full sync...');
  const start = Date.now();

  const customers = await fetchAllCustomers(undefined, (synced, total) => {
    if (synced % 500 === 0 || synced === total) console.log(`  Fetched: ${synced}/${total}`);
  });

  console.log(`[Customer Sync] ${customers.length} customers fetched in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log('[Customer Sync] Writing to database...');

  let success = 0, fail = 0, dupeLinked = 0;
  for (let i = 0; i < customers.length; i++) {
    const wc = customers[i];
    try {
      if (!wc.email) { fail++; continue; }
      const name = [wc.first_name, wc.last_name].filter(Boolean).join(' ') || wc.username || wc.email;
      await prisma.user.upsert({
        where: { wcCustomerId: wc.id },
        create: {
          wcCustomerId: wc.id, email: wc.email, passwordHash: '', name,
          phone: wc.billing?.phone || null, username: wc.username || null,
          ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0,
          createdAt: new Date(wc.date_created),
        },
        update: { name, ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0 },
      });
      success++;
    } catch (err: any) {
      if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
        try {
          await prisma.user.update({
            where: { email: wc.email },
            data: { wcCustomerId: wc.id, ordersCount: wc.orders_count || 0, totalSpent: parseFloat(wc.total_spent) || 0 },
          });
          dupeLinked++;
          success++;
        } catch { fail++; }
      } else {
        fail++;
        if (fail <= 5) console.error(`  Error: ${wc.id} ${wc.email}:`, err.message?.slice(0, 100));
      }
    }
    if ((i + 1) % 1000 === 0) console.log(`  DB progress: ${i + 1}/${customers.length} (${success} ok, ${fail} fail)`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const total = await prisma.user.count();
  console.log(`\n[Customer Sync] COMPLETE in ${elapsed}s`);
  console.log(`  Synced: ${success} | Failed: ${fail} | Dupe-linked: ${dupeLinked}`);
  console.log(`  Total users in DB: ${total}`);

  await prisma.$disconnect();
  await pool.end();
}
run().catch(e => { console.error('FATAL:', e); process.exit(1); });
