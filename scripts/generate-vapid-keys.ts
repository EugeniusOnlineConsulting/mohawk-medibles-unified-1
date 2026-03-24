/**
 * Generate VAPID keys for Web Push Notifications.
 *
 * Usage:
 *   npx tsx scripts/generate-vapid-keys.ts
 *
 * Then add the output to your .env / Vercel environment:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
 *   VAPID_PRIVATE_KEY=<private key>
 *   VAPID_EMAIL=mailto:admin@mohawkmedibles.ca
 */
import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n=== VAPID Keys Generated ===\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:admin@mohawkmedibles.ca`);
console.log("\nAdd these to your .env file and Vercel environment variables.\n");
