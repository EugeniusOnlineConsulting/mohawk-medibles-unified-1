#!/usr/bin/env node
/**
 * Generate remaining 2 hero images (concentrates + territory).
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const PROJECT_ID = 'ommae-prod';
const LOCATION = 'us-central1';
const IMAGEN_ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002:predict`;
const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', 'assets', 'hero');

function getToken() {
  return execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf-8' }).trim();
}

async function generateImage(token, prompt, filename) {
  console.log(`Generating: ${filename}`);
  const res = await fetch(IMAGEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        personGeneration: 'dont_allow',
        safetyFilterLevel: 'block_few',
      },
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  if (!data.predictions?.length) throw new Error('No predictions');
  const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
  await writeFile(join(OUTPUT_DIR, filename), buffer);
  console.log(`  Saved (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const token = getToken();

  // Image 3: Concentrates
  await generateImage(token,
    `Professional 8K extreme macro photography of golden honey-amber glass-like resin slab alongside dark chocolate-brown pressed blocks and brilliant crystalline diamond formations. All arranged on dark slate stone surface. Dramatic side lighting creating warm amber glow with cool blue accent light. Subtle smoke tendrils curling around the products. Dark moody charcoal background with faint golden bokeh circles. Ultra sharp detail, professional extract photography with cinematic depth of field. Luxurious golden amber tones. No text, no watermark.`,
    'hero-concentrates-hash.png'
  );

  // Wait to avoid rate limit
  console.log('Waiting 65s for rate limit...');
  await new Promise(r => setTimeout(r, 65000));

  // Image 4: Territory
  await generateImage(token,
    `Breathtaking 8K cinematic landscape photograph of pristine Canadian wilderness at golden hour sunrise. Lush emerald green forest of oak, maple and pine trees stretching to a distant calm lake reflecting golden sky. Rolling meadows with wildflowers in foreground. Dramatic sky with warm golden-pink sunrise light filtering through majestic clouds, casting long amber shadows across the landscape. Sacred peaceful atmosphere with morning mist hovering ethereally over the ground. Rich earth tones with vivid greens and warm golden light. Pristine untouched Canadian nature, rolling hills and pure wilderness. Cinematic wide-angle landscape photography with incredible depth. No text, no watermark.`,
    'hero-territory-heritage.png'
  );

  console.log('\nAll done!');
}

main().catch(console.error);
