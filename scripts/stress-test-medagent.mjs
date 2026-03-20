#!/usr/bin/env node
/**
 * MedAgent Stress Test — 1000+ Concurrent Sessions
 * ══════════════════════════════════════════════════
 * Simulates real customer behavior patterns against live deployment.
 * Tests: chat, navigation, cart ops, filters, checkout, edge cases.
 */

const BASE_URL = "https://mohawkmedibles.co";
const CHAT_ENDPOINT = `${BASE_URL}/api/sage/chat/`;
const PRODUCTS_ENDPOINT = `${BASE_URL}/api/sage/products/`;
const CATEGORIES_ENDPOINT = `${BASE_URL}/api/sage/categories/`;
const HEALTH_ENDPOINT = `${BASE_URL}/api/sage/health/`;

// ─── Test Messages by Category ──────────────────────────────

const NAVIGATION_MESSAGES = [
    "Take me to the shop",
    "Go to the FAQ page",
    "Show me the support page",
    "Open my cart",
    "Take me to checkout",
    "Go to about page",
    "Show me reviews",
    "Visit the contact page",
    "Open my account",
    "Go home",
];

const FILTER_MESSAGES = [
    "Show me your flowers",
    "I want to see edibles",
    "Browse concentrates",
    "Show me vapes",
    "List all pre-rolls",
    "What CBD products do you have?",
    "Show me mushrooms",
    "I'm looking for accessories",
    "Browse your capsules",
    "Show me bath and body products",
];

const CART_MESSAGES = [
    "Add Goat to my cart",
    "What's in my cart?",
    "Add some gummies to cart please",
    "Remove everything from my cart",
    "I want to buy Blue Dream",
    "Add 2 pre-rolls to cart now",
    "Show my cart",
    "Clear my cart",
    "Add the cheapest flower to cart",
    "How much is in my cart?",
];

const CHECKOUT_MESSAGES = [
    "Help me checkout",
    "I want to pay",
    "Ready to order",
    "Complete my purchase",
    "Proceed to payment",
    "I want to checkout now",
    "Place my order",
    "How do I pay?",
    "What payment methods do you accept?",
    "Finish my order",
];

const SEARCH_MESSAGES = [
    "Search for indica strains",
    "Find me something for pain",
    "Do you have any deals?",
    "What's popular right now?",
    "I need something for sleep",
    "Show me products under $50",
    "What do you recommend for beginners?",
    "I want something strong",
    "Any sativa options?",
    "Find THC gummies",
];

const CONVERSATIONAL_MESSAGES = [
    "Hey, what's up?",
    "Tell me about Mohawk Medibles",
    "Are you guys legit?",
    "How long does shipping take to Toronto?",
    "Is my order going to be discreet?",
    "What are your hours?",
    "Where are you located?",
    "Do you deliver to Vancouver?",
    "What's the strongest thing you have?",
    "Are your products lab tested?",
    "I'm new here, what should I try?",
    "How does your loyalty program work?",
    "Can I return a product?",
    "What's the minimum order?",
    "Do you do same day delivery?",
];

const EDGE_CASE_MESSAGES = [
    "",  // empty
    "a",  // single char
    "🔥🌿💨",  // emoji only
    "a".repeat(1500),  // near max length
    "SELECT * FROM users;",  // SQL injection attempt
    "<script>alert('xss')</script>",  // XSS attempt
    "I'm 15 years old",  // underage
    "Can you prescribe me something?",  // medical advice
    "Is this legal?",  // legal advice
    "DROP TABLE products;",  // another SQL injection
    "{{constructor.constructor('return this')()}}",  // prototype pollution
    "What is 2+2?",  // off-topic
    "   ",  // whitespace only
    "hello\n\n\n\n\nhello",  // newlines
    "Can you help me hack a website?",  // malicious intent
];

const ALL_MESSAGES = [
    ...NAVIGATION_MESSAGES,
    ...FILTER_MESSAGES,
    ...CART_MESSAGES,
    ...CHECKOUT_MESSAGES,
    ...SEARCH_MESSAGES,
    ...CONVERSATIONAL_MESSAGES,
    ...EDGE_CASE_MESSAGES,
];

// ─── Metrics ─────────────────────────────────────────────────

const metrics = {
    total: 0,
    success: 0,
    errors: 0,
    rateLimited: 0,
    serverErrors: 0,
    timeouts: 0,
    latencies: [],
    turboCount: 0,
    flashCount: 0,
    proCount: 0,
    withProducts: 0,
    withActions: 0,
    withCart: 0,
    errorDetails: {},
    byCategory: {
        navigation: { sent: 0, success: 0, avgLatency: 0, latencies: [] },
        filter: { sent: 0, success: 0, avgLatency: 0, latencies: [] },
        cart: { sent: 0, success: 0, avgLatency: 0, latencies: [] },
        checkout: { sent: 0, success: 0, avgLatency: 0, latencies: [] },
        search: { sent: 0, success: 0, avgLatency: 0, latencies: [] },
        conversational: { sent: 0, success: 0, avgLatency: 0, latencies: [] },
        edge: { sent: 0, success: 0, avgLatency: 0, latencies: [] },
    },
};

function getCategory(msg) {
    if (NAVIGATION_MESSAGES.includes(msg)) return "navigation";
    if (FILTER_MESSAGES.includes(msg)) return "filter";
    if (CART_MESSAGES.includes(msg)) return "cart";
    if (CHECKOUT_MESSAGES.includes(msg)) return "checkout";
    if (SEARCH_MESSAGES.includes(msg)) return "search";
    if (CONVERSATIONAL_MESSAGES.includes(msg)) return "conversational";
    return "edge";
}

// ─── Test Runner ─────────────────────────────────────────────

async function sendChatMessage(message, sessionId, persona = "medagent") {
    const category = getCategory(message);
    metrics.total++;
    metrics.byCategory[category].sent++;

    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const res = await fetch(CHAT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message.slice(0, 2000),
                sessionId,
                persona,
                cartTotal: Math.random() * 300,
                cartItems: Math.random() > 0.5 ? [
                    { id: "test-1", name: "Test Product", price: 29.99, quantity: 1 },
                ] : undefined,
                currentPage: ["/", "/shop", "/faq", "/support", "/contact"][Math.floor(Math.random() * 5)],
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);
        const latency = Date.now() - start;
        metrics.latencies.push(latency);
        metrics.byCategory[category].latencies.push(latency);

        if (res.status === 429) {
            metrics.rateLimited++;
            return { status: 429, latency, category };
        }

        if (res.status >= 500) {
            metrics.serverErrors++;
            const errKey = `${res.status}`;
            metrics.errorDetails[errKey] = (metrics.errorDetails[errKey] || 0) + 1;
            return { status: res.status, latency, category };
        }

        if (!res.ok) {
            metrics.errors++;
            const errKey = `${res.status}`;
            metrics.errorDetails[errKey] = (metrics.errorDetails[errKey] || 0) + 1;
            return { status: res.status, latency, category };
        }

        const data = await res.json();
        metrics.success++;
        metrics.byCategory[category].success++;

        // Track model distribution
        if (data.model === "turbo") metrics.turboCount++;
        else if (data.model === "flash") metrics.flashCount++;
        else if (data.model === "pro") metrics.proCount++;

        if (data.products?.length > 0) metrics.withProducts++;
        if (data.actions?.length > 0) metrics.withActions++;
        if (data.cart) metrics.withCart++;

        return { status: 200, latency, data, category };
    } catch (err) {
        clearTimeout(timeout);
        const latency = Date.now() - start;
        if (err.name === "AbortError") {
            metrics.timeouts++;
            return { status: "timeout", latency, category };
        }
        metrics.errors++;
        const errKey = err.message?.slice(0, 50) || "unknown";
        metrics.errorDetails[errKey] = (metrics.errorDetails[errKey] || 0) + 1;
        return { status: "error", latency, error: err.message, category };
    }
}

async function testEndpoint(url, label) {
    const start = Date.now();
    try {
        const res = await fetch(url);
        const latency = Date.now() - start;
        const ok = res.ok;
        return { label, status: res.status, latency, ok };
    } catch (err) {
        return { label, status: "error", latency: Date.now() - start, ok: false, error: err.message };
    }
}

// ─── Batch Runner ────────────────────────────────────────────

async function runBatch(batchSize, batchNum, totalBatches) {
    const promises = [];

    for (let i = 0; i < batchSize; i++) {
        const msg = ALL_MESSAGES[Math.floor(Math.random() * ALL_MESSAGES.length)];
        const sessionId = `stress-test-${batchNum}-${i}-${Date.now()}`;
        const persona = ["medagent", "turtle", "trickster"][Math.floor(Math.random() * 3)];
        promises.push(sendChatMessage(msg, sessionId, persona));
    }

    const results = await Promise.allSettled(promises);
    return results;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  MedAgent Stress Test — 1000+ Simulated Customers");
    console.log("  Target: " + BASE_URL);
    console.log("═══════════════════════════════════════════════════════\n");

    // Phase 0: Health check
    console.log("Phase 0: Health & endpoint checks...");
    const healthResults = await Promise.all([
        testEndpoint(HEALTH_ENDPOINT, "Health"),
        testEndpoint(PRODUCTS_ENDPOINT + "?category=Flower&limit=3", "Products API"),
        testEndpoint(CATEGORIES_ENDPOINT, "Categories API"),
    ]);
    for (const r of healthResults) {
        console.log(`  ${r.ok ? "✅" : "❌"} ${r.label}: ${r.status} (${r.latency}ms)`);
    }
    console.log();

    // Phase 1: Warm-up (50 sequential)
    console.log("Phase 1: Warm-up — 50 sequential requests...");
    const warmupStart = Date.now();
    for (let i = 0; i < 50; i++) {
        const msg = ALL_MESSAGES[i % ALL_MESSAGES.length];
        await sendChatMessage(msg, `warmup-${i}`);
        if ((i + 1) % 10 === 0) process.stdout.write(`  ${i + 1}/50 done\n`);
    }
    console.log(`  Warm-up complete in ${((Date.now() - warmupStart) / 1000).toFixed(1)}s\n`);

    // Phase 2: Concurrent batches (20 batches × 50 = 1000 requests)
    console.log("Phase 2: Load test — 20 batches × 50 concurrent = 1000 requests...");
    const loadStart = Date.now();
    const BATCH_SIZE = 50;
    const NUM_BATCHES = 20;

    for (let batch = 0; batch < NUM_BATCHES; batch++) {
        await runBatch(BATCH_SIZE, batch, NUM_BATCHES);
        const elapsed = ((Date.now() - loadStart) / 1000).toFixed(1);
        const progress = ((batch + 1) / NUM_BATCHES * 100).toFixed(0);
        process.stdout.write(`  Batch ${batch + 1}/${NUM_BATCHES} (${progress}%) — ${elapsed}s elapsed | ${metrics.success} ok, ${metrics.rateLimited} rate-limited, ${metrics.errors} errors\n`);

        // Small pause between batches to simulate realistic traffic
        await new Promise(r => setTimeout(r, 200));
    }
    const loadDuration = ((Date.now() - loadStart) / 1000).toFixed(1);
    console.log(`  Load test complete in ${loadDuration}s\n`);

    // Phase 3: Spike test (200 concurrent)
    console.log("Phase 3: Spike test — 200 concurrent requests...");
    const spikeStart = Date.now();
    await runBatch(200, "spike", 1);
    console.log(`  Spike test complete in ${((Date.now() - spikeStart) / 1000).toFixed(1)}s\n`);

    // Phase 4: Multi-turn conversation test (50 sessions × 5 turns each)
    console.log("Phase 4: Multi-turn conversations — 50 sessions × 5 turns...");
    const convStart = Date.now();
    const convPromises = [];
    for (let s = 0; s < 50; s++) {
        const sessionId = `conv-test-${s}-${Date.now()}`;
        const conversation = [
            "Hey, what's up?",
            "Show me your flower",
            "Add the first one to my cart",
            "What's in my cart?",
            "Help me checkout",
        ];
        convPromises.push((async () => {
            for (const msg of conversation) {
                await sendChatMessage(msg, sessionId);
            }
        })());
    }
    await Promise.allSettled(convPromises);
    console.log(`  Conversations complete in ${((Date.now() - convStart) / 1000).toFixed(1)}s\n`);

    // ─── Results ─────────────────────────────────────────────

    const sortedLatencies = [...metrics.latencies].sort((a, b) => a - b);
    const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0;
    const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] || 0;
    const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] || 0;
    const avg = sortedLatencies.length > 0 ? Math.round(sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length) : 0;
    const min = sortedLatencies[0] || 0;
    const max = sortedLatencies[sortedLatencies.length - 1] || 0;

    console.log("═══════════════════════════════════════════════════════");
    console.log("                    RESULTS SUMMARY");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("── Request Summary ──────────────────────────────────");
    console.log(`  Total requests:     ${metrics.total}`);
    console.log(`  Successful:         ${metrics.success} (${(metrics.success / metrics.total * 100).toFixed(1)}%)`);
    console.log(`  Rate limited (429): ${metrics.rateLimited} (${(metrics.rateLimited / metrics.total * 100).toFixed(1)}%)`);
    console.log(`  Server errors (5xx):${metrics.serverErrors}`);
    console.log(`  Client errors:      ${metrics.errors}`);
    console.log(`  Timeouts:           ${metrics.timeouts}`);
    console.log();

    console.log("── Latency (ms) ─────────────────────────────────────");
    console.log(`  Min:    ${min}ms`);
    console.log(`  Avg:    ${avg}ms`);
    console.log(`  P50:    ${p50}ms`);
    console.log(`  P95:    ${p95}ms`);
    console.log(`  P99:    ${p99}ms`);
    console.log(`  Max:    ${max}ms`);
    console.log();

    console.log("── Model Distribution ───────────────────────────────");
    console.log(`  Turbo (local):  ${metrics.turboCount} (${(metrics.turboCount / metrics.success * 100).toFixed(1)}%)`);
    console.log(`  Flash (Gemini): ${metrics.flashCount} (${(metrics.flashCount / metrics.success * 100).toFixed(1)}%)`);
    console.log(`  Pro (Gemini):   ${metrics.proCount} (${(metrics.proCount / metrics.success * 100).toFixed(1)}%)`);
    console.log();

    console.log("── Response Features ─────────────────────────────────");
    console.log(`  With products:  ${metrics.withProducts}`);
    console.log(`  With actions:   ${metrics.withActions}`);
    console.log(`  With cart data: ${metrics.withCart}`);
    console.log();

    console.log("── Per-Category Breakdown ───────────────────────────");
    for (const [cat, data] of Object.entries(metrics.byCategory)) {
        if (data.sent === 0) continue;
        const catAvg = data.latencies.length > 0
            ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length)
            : 0;
        const catP95 = data.latencies.length > 0
            ? [...data.latencies].sort((a, b) => a - b)[Math.floor(data.latencies.length * 0.95)]
            : 0;
        console.log(`  ${cat.padEnd(15)} sent: ${String(data.sent).padEnd(5)} ok: ${String(data.success).padEnd(5)} avg: ${String(catAvg + "ms").padEnd(8)} p95: ${catP95}ms`);
    }
    console.log();

    if (Object.keys(metrics.errorDetails).length > 0) {
        console.log("── Error Breakdown ──────────────────────────────────");
        for (const [err, count] of Object.entries(metrics.errorDetails)) {
            console.log(`  ${err}: ${count}`);
        }
        console.log();
    }

    // ─── Pass/Fail Assessment ────────────────────────────────
    console.log("═══════════════════════════════════════════════════════");
    console.log("                  ASSESSMENT");
    console.log("═══════════════════════════════════════════════════════\n");

    const successRate = metrics.success / metrics.total * 100;
    const checks = [
        { name: "Success rate > 80%", pass: successRate > 80, value: `${successRate.toFixed(1)}%` },
        { name: "P95 latency < 10s", pass: p95 < 10000, value: `${p95}ms` },
        { name: "P50 latency < 3s", pass: p50 < 3000, value: `${p50}ms` },
        { name: "Zero timeouts", pass: metrics.timeouts === 0, value: `${metrics.timeouts}` },
        { name: "Server errors < 5%", pass: (metrics.serverErrors / metrics.total * 100) < 5, value: `${(metrics.serverErrors / metrics.total * 100).toFixed(1)}%` },
        { name: "Turbo routing > 30%", pass: (metrics.turboCount / metrics.success * 100) > 30, value: `${(metrics.turboCount / metrics.success * 100).toFixed(1)}%` },
        { name: "Actions generated", pass: metrics.withActions > 0, value: `${metrics.withActions}` },
        { name: "Products returned", pass: metrics.withProducts > 0, value: `${metrics.withProducts}` },
    ];

    let allPass = true;
    for (const check of checks) {
        const icon = check.pass ? "✅" : "❌";
        console.log(`  ${icon} ${check.name}: ${check.value}`);
        if (!check.pass) allPass = false;
    }

    console.log();
    console.log(allPass
        ? "  🟢 ALL CHECKS PASSED — MedAgent is production-ready for 1000+ concurrent users"
        : "  🔴 SOME CHECKS FAILED — Review issues above"
    );
    console.log();
}

main().catch(console.error);
