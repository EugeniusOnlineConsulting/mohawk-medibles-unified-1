/**
 * English Dictionary (Baseline)
 * ═════════════════════════════
 * All UI strings. Other dictionaries mirror this structure.
 */
const en = {
    // ─── Navigation ─────────────────────────────────────────
    nav: {
        shop: "Shop",
        about: "About",
        reviews: "Reviews",
        faq: "FAQ",
        support: "Support",
        cart: "Cart",
        search: "Search",
        login: "Member Login",
        talkToSupport: "Talk to Support",
    },

    // ─── Hero / Home ────────────────────────────────────────
    hero: {
        badge: "Indigenous Owned · Six Nations Territory",
        headline: "Premium Cannabis, Rooted in Heritage",
        subheadline: "339+ lab-tested products meeting the Empire Standard™. Flower, edibles, concentrates, and more — delivered Canada-wide.",
        shopNow: "Shop Now",
        learnMore: "Learn More",
    },

    // ─── Shop ───────────────────────────────────────────────
    shop: {
        title: "Shop All Products",
        filterAll: "All",
        addToCart: "Add to Cart",
        outOfStock: "Out of Stock",
        featured: "Featured",
        sortBy: "Sort by",
        newest: "Newest",
        priceLow: "Price: Low to High",
        priceHigh: "Price: High to Low",
        results: "results",
    },

    // ─── Product Detail ─────────────────────────────────────
    product: {
        thc: "THC",
        cbd: "CBD",
        weight: "Weight",
        terpenes: "Terpene Profile",
        description: "Description",
        specs: "Specifications",
        reviews: "Reviews",
        youMightLike: "You Might Also Like",
        quantity: "Quantity",
    },

    // ─── Delivery ───────────────────────────────────────────
    delivery: {
        heroTitle: "Premium Cannabis Delivery",
        whyChoose: "Why Choose Mohawk Medibles for Cannabis Delivery in",
        browseCategories: "Browse Our Cannabis Categories",
        alsoDelivering: "Also Delivering To",
        deliveryFaq: "Delivery FAQ",
        labTested: "Lab Tested",
        products339: "339+ Products",
        open: "Open 9AM–10PM",
        fastDiscreet: "Fast, discreet delivery right to your door",
        empireStandard: "Every product meets the Empire Standard™",
        wideSelection: "Flower, edibles, concentrates, vapes & more",
        orderAnyday: "Order any day of the week",
    },

    // ─── Footer ─────────────────────────────────────────────
    footer: {
        tagline: "Indigenous-owned premium cannabis. Rooted in heritage, tested to perfection.",
        quickLinks: "Quick Links",
        categories: "Categories",
        contact: "Contact",
        rights: "All rights reserved.",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
    },

    // ─── Common ─────────────────────────────────────────────
    common: {
        loading: "Loading...",
        error: "Something went wrong",
        viewAll: "View All",
        backToShop: "Back to Shop",
        close: "Close",
        language: "Language",
    },
};

export default en;

// Use a deep-string type so other dictionaries can have different string values
type DeepStringify<T> = {
    [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};
export type DictionarySchema = DeepStringify<typeof en>;
