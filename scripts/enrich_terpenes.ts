/**
 * Terpene & Effects Enrichment Script
 * ════════════════════════════════════
 * Reads full_products_v2.json, enriches empty terpenes[] and adds effects[]
 * based on category, product name keywords, and strain type indicators.
 * Then writes enriched data back to both JSON and productData.ts.
 *
 * Usage: npx tsx scripts/enrich_terpenes.ts
 */

import * as fs from "fs";
import * as path from "path";

// ─── Terpene Profiles by Strain Type ────────────────────────

const INDICA_TERPENES = ["Myrcene", "Linalool", "Caryophyllene"];
const SATIVA_TERPENES = ["Limonene", "Pinene", "Terpinolene"];
const HYBRID_TERPENES = ["Myrcene", "Limonene", "Caryophyllene"];
const CBD_TERPENES = ["Caryophyllene", "Myrcene", "Bisabolol"];

// ─── Effects by Strain Type ─────────────────────────────────

const INDICA_EFFECTS = ["relaxed", "sleepy", "calm", "happy"];
const SATIVA_EFFECTS = ["energetic", "uplifted", "creative", "focused"];
const HYBRID_EFFECTS = ["relaxed", "happy", "uplifted", "euphoric"];
const CBD_EFFECTS = ["calm", "relaxed", "focused"];

// ─── Category-Specific Mappings ─────────────────────────────

const CATEGORY_DEFAULTS: Record<string, { terpenes: string[]; effects: string[] }> = {
    "Flower": { terpenes: HYBRID_TERPENES, effects: HYBRID_EFFECTS },
    "Edibles": { terpenes: [], effects: ["happy", "relaxed", "euphoric"] },
    "Concentrates": { terpenes: HYBRID_TERPENES, effects: ["euphoric", "relaxed", "creative"] },
    "Vapes": { terpenes: HYBRID_TERPENES, effects: ["uplifted", "relaxed", "happy"] },
    "Pre-Rolls": { terpenes: HYBRID_TERPENES, effects: HYBRID_EFFECTS },
    "CBD": { terpenes: CBD_TERPENES, effects: CBD_EFFECTS },
    "Bath & Body": { terpenes: [], effects: ["calm", "relaxed"] },
    "Accessories": { terpenes: [], effects: [] },
    "Capsules": { terpenes: [], effects: ["calm", "relaxed", "focused"] },
    "Mushrooms": { terpenes: [], effects: ["euphoric", "creative", "uplifted", "introspective"] },
    "Wellness": { terpenes: CBD_TERPENES, effects: ["calm", "focused", "relaxed"] },
    "Brands": { terpenes: HYBRID_TERPENES, effects: HYBRID_EFFECTS },
    "Hash": { terpenes: ["Myrcene", "Caryophyllene", "Pinene"], effects: ["relaxed", "euphoric", "happy"] },
};

// ─── Name-Based Strain Detection ────────────────────────────

function detectStrainType(name: string, type: string, desc: string): "indica" | "sativa" | "hybrid" | "cbd" | null {
    const text = `${name} ${type} ${desc}`.toLowerCase();

    if (text.includes("indica")) return "indica";
    if (text.includes("sativa")) return "sativa";
    if (text.includes("hybrid")) return "hybrid";
    if (text.includes("cbd") || text.includes("cannabidiol")) return "cbd";

    const indicaStrains = ["kush", "purple", "granddaddy", "northern lights", "bubba", "do-si-do", "ice cream", "gelato", "zkittlez", "gorilla glue", "death bubba", "pink", "rockstar", "master kush", "hindu", "tom ford", "tuna kush", "og kush", "black diamond", "mku", "death star", "diablo"];
    const sativaStrains = ["haze", "jack", "durban", "green crack", "lemon", "tangie", "amnesia", "super silver", "strawberry cough", "maui", "trainwreck", "sour diesel", "blue dream", "pineapple"];

    for (const s of indicaStrains) {
        if (text.includes(s)) return "indica";
    }
    for (const s of sativaStrains) {
        if (text.includes(s)) return "sativa";
    }

    return null;
}

// ─── Effect Enrichment from Description Keywords ────────────

function detectEffectsFromDescription(desc: string): string[] {
    const text = desc.toLowerCase();
    const effects: string[] = [];

    if (text.includes("relax") || text.includes("calm") || text.includes("sooth")) effects.push("relaxed");
    if (text.includes("sleep") || text.includes("insomnia") || text.includes("bedtime") || text.includes("night")) effects.push("sleepy");
    if (text.includes("energy") || text.includes("energiz") || text.includes("alert") || text.includes("morning")) effects.push("energetic");
    if (text.includes("creative") || text.includes("creativity") || text.includes("inspir")) effects.push("creative");
    if (text.includes("focus") || text.includes("concentrat") || text.includes("productiv")) effects.push("focused");
    if (text.includes("euphori") || text.includes("bliss") || text.includes("uplift")) effects.push("euphoric");
    if (text.includes("happy") || text.includes("joy") || text.includes("mood") || text.includes("giggly")) effects.push("happy");
    if (text.includes("hunger") || text.includes("appetite") || text.includes("munchies")) effects.push("hungry");
    if (text.includes("pain") || text.includes("ache") || text.includes("inflammation") || text.includes("relief")) effects.push("pain-relief");
    if (text.includes("anxiety") || text.includes("stress") || text.includes("tension")) effects.push("calm");

    return [...new Set(effects)];
}

// ─── Main Enrichment ────────────────────────────────────────

function main() {
    const jsonPath = path.join(__dirname, "..", "full_products_v2.json");
    const tsPath = path.join(__dirname, "..", "lib", "productData.ts");

    // Read JSON source
    const products = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    let terpeneCount = 0;
    let effectCount = 0;

    for (const p of products) {
        const desc = (p.shortDescription || "") + " " + (p.descriptionHTML || "");
        const strainType = detectStrainType(p.name, p.specs?.type || "", desc);

        // Enrich terpenes if empty
        if (!p.specs) p.specs = { thc: "TBD", cbd: "TBD", type: "", weight: "", terpenes: [], lineage: "" };
        if (!p.specs.terpenes || p.specs.terpenes.length === 0) {
            if (strainType === "indica") p.specs.terpenes = INDICA_TERPENES;
            else if (strainType === "sativa") p.specs.terpenes = SATIVA_TERPENES;
            else if (strainType === "hybrid") p.specs.terpenes = HYBRID_TERPENES;
            else if (strainType === "cbd") p.specs.terpenes = CBD_TERPENES;
            else {
                const catDefaults = CATEGORY_DEFAULTS[p.category];
                p.specs.terpenes = catDefaults ? [...catDefaults.terpenes] : [];
            }
            if (p.specs.terpenes.length > 0) terpeneCount++;
        }

        // Add effects field
        const descEffects = detectEffectsFromDescription(desc);

        if (descEffects.length >= 2) {
            p.effects = descEffects.slice(0, 4);
        } else if (strainType === "indica") {
            p.effects = [...INDICA_EFFECTS];
        } else if (strainType === "sativa") {
            p.effects = [...SATIVA_EFFECTS];
        } else if (strainType === "hybrid") {
            p.effects = [...HYBRID_EFFECTS];
        } else if (strainType === "cbd") {
            p.effects = [...CBD_EFFECTS];
        } else {
            const catDefaults = CATEGORY_DEFAULTS[p.category];
            p.effects = catDefaults ? [...catDefaults.effects] : [];
        }

        if (p.effects.length > 0) effectCount++;
    }

    // Write enriched JSON
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf-8");

    // Update productData.ts — replace only the PRODUCTS array, keep functions
    const tsContent = fs.readFileSync(tsPath, "utf-8");

    // Find the array boundaries
    const arrayStart = tsContent.indexOf("export const PRODUCTS: Product[] = [");
    const arrayEnd = tsContent.indexOf("];\n\n\nexport function", arrayStart);

    if (arrayStart === -1 || arrayEnd === -1) {
        console.error("Could not find PRODUCTS array boundaries in productData.ts");
        console.log("arrayStart:", arrayStart, "arrayEnd:", arrayEnd);
        // Try alternate ending pattern
        const altEnd = tsContent.indexOf("];\n\nexport function", arrayStart);
        if (altEnd === -1) {
            console.error("Also failed with alternate pattern. Skipping TS update.");
            console.log(`\nJSON enrichment complete:`);
            console.log(`  - ${products.length} products processed`);
            console.log(`  - ${terpeneCount} terpene profiles added`);
            console.log(`  - ${effectCount} effect profiles added`);
            return;
        }
    }

    const beforeArray = tsContent.substring(0, arrayStart);
    const afterArray = tsContent.substring(arrayEnd! + 2); // skip "];"

    const newTsContent = beforeArray
        + "export const PRODUCTS: Product[] = "
        + JSON.stringify(products, null, 4)
        + ";\n"
        + afterArray;

    fs.writeFileSync(tsPath, newTsContent, "utf-8");

    console.log(`Enrichment complete:`);
    console.log(`  - ${products.length} products processed`);
    console.log(`  - ${terpeneCount} terpene profiles added`);
    console.log(`  - ${effectCount} effect profiles added`);
}

main();
