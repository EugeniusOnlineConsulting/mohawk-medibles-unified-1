/**
 * French Dictionary (Français)
 * ═════════════════════════════
 * Full French translation for Canadian audience.
 */
import type { DictionarySchema } from "./en";

const fr: DictionarySchema = {
    nav: {
        shop: "Boutique",
        about: "À propos",
        reviews: "Avis",
        faq: "FAQ",
        support: "Aide",
        cart: "Panier",
        search: "Rechercher",
        login: "Connexion membre",
        talkToSupport: "Contacter le support",
    },

    hero: {
        badge: "Propriété autochtone · Territoire des Six Nations",
        headline: "Cannabis premium, enraciné dans le patrimoine",
        subheadline: "Plus de 339 produits testés en laboratoire répondant au Empire Standard™. Fleurs, comestibles, concentrés et plus — livraison partout au Canada.",
        shopNow: "Magasiner",
        learnMore: "En savoir plus",
    },

    shop: {
        title: "Tous les produits",
        filterAll: "Tout",
        addToCart: "Ajouter au panier",
        outOfStock: "Rupture de stock",
        featured: "En vedette",
        sortBy: "Trier par",
        newest: "Nouveautés",
        priceLow: "Prix : croissant",
        priceHigh: "Prix : décroissant",
        results: "résultats",
    },

    product: {
        thc: "THC",
        cbd: "CBD",
        weight: "Poids",
        terpenes: "Profil terpénique",
        description: "Description",
        specs: "Spécifications",
        reviews: "Avis",
        youMightLike: "Vous aimerez aussi",
        quantity: "Quantité",
    },

    delivery: {
        heroTitle: "Livraison de cannabis premium",
        whyChoose: "Pourquoi choisir Mohawk Medibles pour la livraison de cannabis à",
        browseCategories: "Parcourir nos catégories",
        alsoDelivering: "Nous livrons aussi à",
        deliveryFaq: "FAQ livraison",
        labTested: "Testé en labo",
        products339: "339+ produits",
        open: "Ouvert 9h–22h",
        fastDiscreet: "Livraison rapide et discrète à votre porte",
        empireStandard: "Chaque produit répond au Empire Standard™",
        wideSelection: "Fleurs, comestibles, concentrés, vapes et plus",
        orderAnyday: "Commandez tous les jours de la semaine",
    },

    footer: {
        tagline: "Cannabis premium autochtone. Enraciné dans le patrimoine, testé à la perfection.",
        quickLinks: "Liens rapides",
        categories: "Catégories",
        contact: "Contact",
        rights: "Tous droits réservés.",
        privacy: "Politique de confidentialité",
        terms: "Conditions d'utilisation",
    },

    common: {
        loading: "Chargement...",
        error: "Une erreur s'est produite",
        viewAll: "Voir tout",
        backToShop: "Retour à la boutique",
        close: "Fermer",
        language: "Langue",
    },
} as const;

export default fr;
