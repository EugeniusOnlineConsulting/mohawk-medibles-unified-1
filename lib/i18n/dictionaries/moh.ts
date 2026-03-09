/**
 * Kanyen'kéha (Mohawk) Dictionary
 * ════════════════════════════════
 * Core UI strings in Kanyen'kéha. Product-specific terms
 * remain in English pending Indigenous language review.
 *
 * Note: Kanyen'kéha is a polysynthetic Iroquoian language.
 * These translations use common community phrasings.
 * Professional review by a Kanyen'kéha language keeper
 * is recommended before production use.
 */
import type { DictionarySchema } from "./en";

const moh: DictionarySchema = {
    nav: {
        shop: "Atenniónni",          // "to buy/trade"
        about: "Oh nahò:ten",        // "what is it / about"
        reviews: "Ionterihwaienstáhkhwa", // "they evaluate"
        faq: "Otién:na",             // "questions"
        support: "Iethinihsnién:ni", // "they help us"
        cart: "Ka'sere'tsherá:ke",   // "carrying basket"
        search: "Iesá:iere",         // "you search"
        login: "Satahónhstat",       // "enter"
        talkToSupport: "Tasatáti",   // "speak"
    },

    hero: {
        badge: "Onkwehón:we raotirihwá:ke · Tsí Ia:iak Niionkwetá:ke",
        headline: "Ón:kwe Kahionhátie, Tsi Niionkwarihó:ten Teiakotáhsawen",
        subheadline: "339+ teieiéstahkhwa. Oié:ri, kanatarowanénhtha, tsi niió:re — Canada akwékon.",
        shopNow: "Atenniónni nonwá",
        learnMore: "Sewatahonhsí:iohst",
    },

    shop: {
        title: "Akwékon Kahionhátie",
        filterAll: "Akwékon",
        addToCart: "Kasennón:ni",
        outOfStock: "Iáh tekanónhton",
        featured: "Iehia:ráhstha",
        sortBy: "Satié:ren",
        newest: "Á:se",
        priceLow: "Ohwistánohon",
        priceHigh: "Kaiá:ton",
        results: "kaiá:ton",
    },

    product: {
        thc: "THC",
        cbd: "CBD",
        weight: "Ie'nikonhriió:stha",
        terpenes: "Otsí:tsia",
        description: "Tsi nahó:ten",
        specs: "Tsi niió:re",
        reviews: "Ionterihwaienstáhkhwa",
        youMightLike: "Enhsénhake nó:nen",
        quantity: "Tó: nahé:ien",
    },

    delivery: {
        heroTitle: "Kahionhátie Iesá:wis",
        whyChoose: "Oh ní:ioht teiesanónhianion ne Mohawk Medibles tsi",
        browseCategories: "Satká:tho akwékon",
        alsoDelivering: "Shé:kon tó:ka nikaniatarà:ke",
        deliveryFaq: "Otién:na — Iesá:wis",
        labTested: "Teieiéstahkhwa",
        products339: "339+ kahionhátie",
        open: "Tewathón:ni 9–22",
        fastDiscreet: "Ó:nen ok tánon ionkwaterihwahkhwáhson",
        empireStandard: "Akwékon tehotiienáweron ne Empire Standard™",
        wideSelection: "Oié:ri, kanatarowanénhtha, tsi niió:re",
        orderAnyday: "Sewatiénni nià:wen tsí niioserá:ke",
    },

    footer: {
        tagline: "Onkwehón:we kahionhátie. Tsi niionkwarihó:ten teiakotáhsawen, teieiéstahkhwa.",
        quickLinks: "Ionterihwaién:ni",
        categories: "Nikaniatará:ke",
        contact: "Iesanónhianion",
        rights: "Akwékon tsi ionkwarihwá:ke.",
        privacy: "Tsi nikanaktiió:ten",
        terms: "Tsi niiohserá:ke",
    },

    common: {
        loading: "Tehatihehré:tha...",
        error: "Ó:ia iakoiatatié:ren",
        viewAll: "Satká:tho akwékon",
        backToShop: "Sé:waton",
        close: "Sate:wón:ni",
        language: "Kawennà:ke",
    },
} as const;

export default moh;
