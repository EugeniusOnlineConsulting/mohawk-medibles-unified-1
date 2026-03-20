#!/usr/bin/env node
/**
 * Generate 4 unique hero images for Mohawk Medibles using Imagen 3.
 * Auth via gcloud CLI (ommae-prod project).
 * Output: public/assets/hero/hero-{1-4}.png
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const PROJECT_ID = 'ommae-prod';
const LOCATION = 'us-central1';
const IMAGEN_ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002:predict`;
const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', 'assets', 'hero');

// ─── Get token via gcloud CLI (execFileSync — no shell injection) ──
function getToken() {
  return execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf-8' }).trim();
}

// ─── Imagen 3 Generate ───────────────────────────────
async function generateImage(token, prompt, filename) {
  console.log(`\nGenerating: ${filename}`);
  console.log(`Prompt: ${prompt.slice(0, 80)}...`);

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

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Imagen 3 API ${res.status}: ${error.slice(0, 300)}`);
  }

  const data = await res.json();
  if (!data.predictions?.length) {
    throw new Error(`No predictions returned for ${filename}`);
  }

  const pred = data.predictions[0];
  const buffer = Buffer.from(pred.bytesBase64Encoded, 'base64');
  const filePath = join(OUTPUT_DIR, filename);
  await writeFile(filePath, buffer);
  console.log(`  Saved: ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return filePath;
}

// ─── Hero Image Prompts (8K quality, no text/watermark) ─────
const HERO_IMAGES = [
  {
    filename: 'hero-flower-premium.png',
    prompt: `Ultra-realistic 8K product photography of premium cannabis flower buds on a dark matte obsidian surface. Extreme macro detail showing trichomes glistening like tiny crystals, vibrant deep green and royal purple hues with bright orange pistil hairs. Dramatic moody studio lighting with a single warm spotlight from top-left creating deep dramatic shadows. Subtle ethereal smoke wisps rising from the buds. Background is deep charcoal black with faint emerald green bokeh orbs. Professional product shot with ultra sharp focus, shallow depth of field, cinematic color grading. Photorealistic quality. No text, no watermark.`,
  },
  {
    filename: 'hero-edibles-gummies.png',
    prompt: `Stunning 8K commercial product photography of luxury premium colorful fruit gummies candy on a dark obsidian surface. Beautifully arranged assorted fruit-shaped gummies in vibrant ruby red, tangerine orange, emerald green, sunshine yellow. Some gummies stacked showing glossy sugar-coated texture with visible sparkling sugar crystals. Dramatic warm golden rim lighting with soft bokeh. Subtle mystical mist rising in the background. Background transitions from deep black to dark forest green gradient. Every gummy perfectly in focus with incredible detail. Luxurious premium candy photography style, appetizing and elegant. No text, no watermark.`,
  },
  {
    filename: 'hero-concentrates-hash.png',
    prompt: `Professional 8K extreme macro photography of golden honey-amber glass-like resin slab alongside dark chocolate-brown pressed blocks and brilliant crystalline diamond formations. All arranged on dark slate stone surface. Dramatic side lighting creating warm amber glow with cool blue accent light. Subtle smoke tendrils curling around the products. Dark moody charcoal background with faint golden bokeh circles. Ultra sharp detail, professional extract photography with cinematic depth of field. Luxurious golden amber tones. No text, no watermark.`,
  },
  {
    filename: 'hero-territory-heritage.png',
    prompt: `Breathtaking 8K cinematic landscape photograph of pristine Canadian wilderness at golden hour sunrise. Lush emerald green forest of oak, maple and pine trees stretching to a distant calm lake reflecting golden sky. Rolling meadows with wildflowers in foreground. Dramatic sky with warm golden-pink sunrise light filtering through majestic clouds, casting long amber shadows across the landscape. Sacred peaceful atmosphere with morning mist hovering ethereally over the ground. Rich earth tones with vivid greens and warm golden light. Pristine untouched Canadian nature, rolling hills and pure wilderness. Cinematic wide-angle landscape photography with incredible depth. No text, no watermark.`,
  },
];

// ─── Main ─────────────────────────────────────────────
async function main() {
  console.log('═══ Mohawk Medibles Hero Image Generator ═══');
  console.log('Using: Imagen 3 via Vertex AI (gcloud auth)\n');

  await mkdir(OUTPUT_DIR, { recursive: true });
  const token = getToken();
  console.log('gcloud token acquired.\n');

  const results = [];
  for (const img of HERO_IMAGES) {
    try {
      await generateImage(token, img.prompt, img.filename);
      results.push({ filename: img.filename, status: 'success' });
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      results.push({ filename: img.filename, status: 'failed' });
    }
  }

  console.log('\n═══ Results ═══');
  for (const r of results) {
    console.log(`  ${r.status === 'success' ? '✓' : '✗'} ${r.filename}`);
  }
}

main().catch(console.error);
