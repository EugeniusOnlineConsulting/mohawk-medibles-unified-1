/**
 * Mohawk Medibles — City-Level Delivery Data
 * ════════════════════════════════════════════
 * Comprehensive city data for 70+ Canadian cities across all provinces/territories.
 * Powers the /delivery hub, province pages, and city-specific delivery landing pages.
 */

export interface CityData {
    slug: string;
    name: string;
    population: string;
    landmark: string;
    description: string;
    deliveryTime: string;
    lat: number;
    lng: number;
}

export interface ProvinceData {
    slug: string;
    name: string;
    abbreviation: string;
    legalAge: number;
    deliveryTime: string;
    cities: CityData[];
    /** Matches existing /[slug] page (e.g. "ontario-delivery") */
    legacySlug: string;
}

export const PROVINCES: ProvinceData[] = [
    {
        slug: "ontario",
        name: "Ontario",
        abbreviation: "ON",
        legalAge: 19,
        deliveryTime: "1-3 business days",
        legacySlug: "ontario-delivery",
        cities: [
            { slug: "toronto", name: "Toronto", population: "2.8M", landmark: "CN Tower", description: "Toronto is Canada's largest city and a thriving cannabis market. Mohawk Medibles delivers premium cannabis products directly to your door across the GTA — from downtown to Scarborough, North York, and Etobicoke.", deliveryTime: "1-2 business days", lat: 43.6532, lng: -79.3832 },
            { slug: "ottawa", name: "Ottawa", population: "1.0M", landmark: "Parliament Hill", description: "Ottawa, Canada's capital, has a growing cannabis scene. Mohawk Medibles ships premium flower, edibles, concentrates, and hash to Ottawa and Gatineau region via Canada Post Xpresspost.", deliveryTime: "1-2 business days", lat: 45.4215, lng: -75.6972 },
            { slug: "mississauga", name: "Mississauga", population: "717K", landmark: "Absolute World Towers", description: "Mississauga residents enjoy fast cannabis delivery from Mohawk Medibles. Located in the heart of Peel Region, we deliver premium lab-tested products with discreet packaging to your doorstep.", deliveryTime: "1-2 business days", lat: 43.5890, lng: -79.6441 },
            { slug: "hamilton", name: "Hamilton", population: "569K", landmark: "Dundurn Castle", description: "Hamilton's cannabis community trusts Mohawk Medibles for premium, lab-tested products. As one of our closest major cities, Hamilton customers enjoy some of the fastest delivery times in Canada.", deliveryTime: "1-2 business days", lat: 43.2557, lng: -79.8711 },
            { slug: "london", name: "London", population: "422K", landmark: "Fanshawe Pioneer Village", description: "London, Ontario cannabis enthusiasts choose Mohawk Medibles for premium flower, edibles, and concentrates. Fast Xpresspost delivery to the Forest City and surrounding communities.", deliveryTime: "1-2 business days", lat: 42.9849, lng: -81.2453 },
            { slug: "brampton", name: "Brampton", population: "656K", landmark: "Gage Park", description: "Brampton residents get premium cannabis delivered discreetly from Mohawk Medibles. Serving all of Peel Region with lab-tested flower, edibles, hash, and concentrates.", deliveryTime: "1-2 business days", lat: 43.7315, lng: -79.7624 },
            { slug: "kitchener", name: "Kitchener", population: "256K", landmark: "Victoria Park", description: "Kitchener-Waterloo cannabis customers trust Mohawk Medibles for Empire Standard™ quality. Fast delivery to KW, Cambridge, and the entire Waterloo Region.", deliveryTime: "1-2 business days", lat: 43.4516, lng: -80.4925 },
            { slug: "windsor", name: "Windsor", population: "229K", landmark: "Ambassador Bridge", description: "Windsor, Ontario's southernmost city, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped via Xpresspost to Windsor and Essex County.", deliveryTime: "2-3 business days", lat: 42.3149, lng: -83.0364 },
            { slug: "markham", name: "Markham", population: "338K", landmark: "Markham Museum", description: "Markham residents enjoy premium cannabis delivery from Mohawk Medibles. Serving York Region with discreet, tracked shipping of flower, edibles, and concentrates.", deliveryTime: "1-2 business days", lat: 43.8561, lng: -79.3370 },
            { slug: "vaughan", name: "Vaughan", population: "323K", landmark: "Canada's Wonderland", description: "Vaughan cannabis customers get fast delivery from Mohawk Medibles. Premium, lab-tested products shipped to Woodbridge, Maple, Kleinburg, and all Vaughan communities.", deliveryTime: "1-2 business days", lat: 43.8361, lng: -79.4983 },
            { slug: "oakville", name: "Oakville", population: "213K", landmark: "Bronte Harbour", description: "Oakville's cannabis community chooses Mohawk Medibles for premium quality and discreet delivery. Serving Halton Region with Empire Standard™ products.", deliveryTime: "1-2 business days", lat: 43.4675, lng: -79.6877 },
            { slug: "barrie", name: "Barrie", population: "147K", landmark: "Spirit Catcher Sculpture", description: "Barrie and Simcoe County cannabis delivery from Mohawk Medibles. Premium flower, edibles, and concentrates shipped fast to cottage country and beyond.", deliveryTime: "1-2 business days", lat: 44.3894, lng: -79.6903 },
            { slug: "guelph", name: "Guelph", population: "143K", landmark: "Basilica of Our Lady", description: "Guelph cannabis lovers trust Mohawk Medibles for lab-tested, premium products. Fast Xpresspost delivery to the Royal City and Wellington County.", deliveryTime: "1-2 business days", lat: 43.5448, lng: -80.2482 },
            { slug: "kingston", name: "Kingston", population: "132K", landmark: "Fort Henry", description: "Kingston, home to Queen's University, enjoys premium cannabis delivery from Mohawk Medibles. Lab-tested flower, edibles, and concentrates shipped to the Limestone City.", deliveryTime: "1-2 business days", lat: 44.2312, lng: -76.4860 },
            { slug: "st-catharines", name: "St. Catharines", population: "133K", landmark: "Niagara Falls (nearby)", description: "St. Catharines and Niagara Region cannabis delivery from Mohawk Medibles. Premium products shipped to the Garden City, Niagara Falls, and Welland.", deliveryTime: "1-2 business days", lat: 43.1594, lng: -79.2469 },
            { slug: "oshawa", name: "Oshawa", population: "166K", landmark: "Parkwood Estate", description: "Oshawa and Durham Region cannabis delivery from Mohawk Medibles. Lab-tested flower, edibles, concentrates, and vapes shipped fast to Whitby, Ajax, and Pickering.", deliveryTime: "1-2 business days", lat: 43.8971, lng: -78.8658 },
            { slug: "sudbury", name: "Sudbury", population: "166K", landmark: "Big Nickel", description: "Greater Sudbury, Northern Ontario's largest city, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to Sudbury and surrounding communities.", deliveryTime: "2-3 business days", lat: 46.4917, lng: -80.9930 },
            { slug: "thunder-bay", name: "Thunder Bay", population: "108K", landmark: "Sleeping Giant", description: "Thunder Bay cannabis delivery from Mohawk Medibles. Premium products shipped to Northwestern Ontario via Canada Post Xpresspost with full tracking.", deliveryTime: "2-3 business days", lat: 48.3809, lng: -89.2477 },
            { slug: "peterborough", name: "Peterborough", population: "83K", landmark: "Peterborough Lift Lock", description: "Peterborough cannabis customers trust Mohawk Medibles for premium, lab-tested products. Fast delivery to the Electric City and Kawartha Lakes region.", deliveryTime: "1-2 business days", lat: 44.3091, lng: -78.3197 },
            { slug: "belleville", name: "Belleville", population: "55K", landmark: "Glanmore National Historic Site", description: "Belleville and Bay of Quinte cannabis delivery from Mohawk Medibles. As a nearby community, Belleville enjoys some of our fastest shipping times.", deliveryTime: "1 business day", lat: 44.1628, lng: -77.3832 },
        ],
    },
    {
        slug: "quebec",
        name: "Quebec",
        abbreviation: "QC",
        legalAge: 21,
        deliveryTime: "2-4 business days",
        legacySlug: "quebec-delivery",
        cities: [
            { slug: "montreal", name: "Montreal", population: "1.8M", landmark: "Mount Royal", description: "Montreal is Canada's second-largest city and a cannabis culture hub. Mohawk Medibles delivers premium flower, edibles, concentrates, and hash across the island and Greater Montreal.", deliveryTime: "1-2 business days", lat: 45.5017, lng: -73.5673 },
            { slug: "quebec-city", name: "Quebec City", population: "549K", landmark: "Château Frontenac", description: "Quebec City cannabis delivery from Mohawk Medibles. Premium lab-tested products shipped to La Vieille Capitale and the surrounding Quebec City metropolitan area.", deliveryTime: "2-3 business days", lat: 46.8139, lng: -71.2080 },
            { slug: "laval", name: "Laval", population: "438K", landmark: "Centre de la Nature", description: "Laval cannabis delivery from Mohawk Medibles. Fast shipping of premium flower, edibles, and concentrates to Quebec's third-largest city.", deliveryTime: "1-2 business days", lat: 45.6066, lng: -73.7124 },
            { slug: "gatineau", name: "Gatineau", population: "291K", landmark: "Canadian Museum of History", description: "Gatineau cannabis customers enjoy fast delivery from Mohawk Medibles. Premium products shipped to the National Capital Region across the Ottawa River.", deliveryTime: "1-2 business days", lat: 45.4765, lng: -75.7013 },
            { slug: "longueuil", name: "Longueuil", population: "253K", landmark: "Parc Michel-Chartrand", description: "Longueuil and South Shore cannabis delivery from Mohawk Medibles. Premium lab-tested products to Brossard, Saint-Hubert, and the entire Montérégie region.", deliveryTime: "1-2 business days", lat: 45.5312, lng: -73.5185 },
            { slug: "sherbrooke", name: "Sherbrooke", population: "168K", landmark: "Mont-Bellevue Park", description: "Sherbrooke cannabis delivery from Mohawk Medibles. Premium flower, edibles, and concentrates shipped to the Eastern Townships and Estrie region.", deliveryTime: "2-3 business days", lat: 45.4042, lng: -71.8929 },
            { slug: "trois-rivieres", name: "Trois-Rivières", population: "140K", landmark: "Old Prison of Trois-Rivières", description: "Trois-Rivières cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the heart of Quebec's Mauricie region.", deliveryTime: "2-3 business days", lat: 46.3432, lng: -72.5419 },
            { slug: "levis", name: "Lévis", population: "149K", landmark: "Terrasse de Lévis", description: "Lévis cannabis delivery from Mohawk Medibles. Premium products shipped across the St. Lawrence from Quebec City to the Chaudière-Appalaches region.", deliveryTime: "2-3 business days", lat: 46.8032, lng: -71.1780 },
        ],
    },
    {
        slug: "british-columbia",
        name: "British Columbia",
        abbreviation: "BC",
        legalAge: 19,
        deliveryTime: "2-4 business days",
        legacySlug: "british-columbia-delivery",
        cities: [
            { slug: "vancouver", name: "Vancouver", population: "662K", landmark: "Stanley Park", description: "Vancouver leads Canada's cannabis culture. Mohawk Medibles ships premium flower, edibles, concentrates, and hash to Vancouver, Burnaby, and Metro Vancouver via Xpresspost.", deliveryTime: "2-3 business days", lat: 49.2827, lng: -123.1207 },
            { slug: "victoria", name: "Victoria", population: "92K", landmark: "Butchart Gardens", description: "Victoria, BC's capital on Vancouver Island, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the Garden City and surrounding communities.", deliveryTime: "3-4 business days", lat: 48.4284, lng: -123.3656 },
            { slug: "surrey", name: "Surrey", population: "568K", landmark: "Surrey Civic Plaza", description: "Surrey, BC's second-largest city, trusts Mohawk Medibles for premium cannabis delivery. Serving all of South Surrey, Newton, Fleetwood, and Cloverdale.", deliveryTime: "2-3 business days", lat: 49.1913, lng: -122.8490 },
            { slug: "burnaby", name: "Burnaby", population: "249K", landmark: "Burnaby Mountain", description: "Burnaby cannabis delivery from Mohawk Medibles. Premium lab-tested products shipped to Metrotown, Brentwood, and all Burnaby neighbourhoods.", deliveryTime: "2-3 business days", lat: 49.2488, lng: -122.9805 },
            { slug: "kelowna", name: "Kelowna", population: "144K", landmark: "Ogopogo Statue", description: "Kelowna and Okanagan cannabis delivery from Mohawk Medibles. Premium flower, edibles, and concentrates shipped to wine country and beyond.", deliveryTime: "3-4 business days", lat: 49.8880, lng: -119.4960 },
            { slug: "kamloops", name: "Kamloops", population: "100K", landmark: "Kamloops Heritage Railway", description: "Kamloops cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the Tournament Capital and Thompson-Okanagan region.", deliveryTime: "3-4 business days", lat: 50.6745, lng: -120.3273 },
            { slug: "nanaimo", name: "Nanaimo", population: "99K", landmark: "Nanaimo Bastion", description: "Nanaimo and mid-Vancouver Island cannabis delivery from Mohawk Medibles. Premium products shipped to the Harbour City and surrounding communities.", deliveryTime: "3-4 business days", lat: 49.1659, lng: -123.9401 },
            { slug: "abbotsford", name: "Abbotsford", population: "159K", landmark: "Abbotsford International Airshow", description: "Abbotsford and Fraser Valley cannabis delivery from Mohawk Medibles. Premium lab-tested flower, edibles, and concentrates shipped to the City in the Country.", deliveryTime: "2-3 business days", lat: 49.0504, lng: -122.3045 },
            { slug: "richmond", name: "Richmond", population: "209K", landmark: "Richmond Olympic Oval", description: "Richmond cannabis delivery from Mohawk Medibles. Premium products shipped to Steveston, City Centre, and all Richmond communities.", deliveryTime: "2-3 business days", lat: 49.1666, lng: -123.1336 },
        ],
    },
    {
        slug: "alberta",
        name: "Alberta",
        abbreviation: "AB",
        legalAge: 18,
        deliveryTime: "2-4 business days",
        legacySlug: "alberta-delivery",
        cities: [
            { slug: "calgary", name: "Calgary", population: "1.3M", landmark: "Calgary Tower", description: "Calgary is Alberta's largest city and a major cannabis market. Mohawk Medibles delivers premium flower, edibles, concentrates, and hash across Calgary and surrounding communities.", deliveryTime: "2-3 business days", lat: 51.0447, lng: -114.0719 },
            { slug: "edmonton", name: "Edmonton", population: "1.0M", landmark: "West Edmonton Mall", description: "Edmonton, Alberta's capital, enjoys premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped fast to the City of Champions and greater Edmonton area.", deliveryTime: "2-3 business days", lat: 53.5461, lng: -113.4938 },
            { slug: "red-deer", name: "Red Deer", population: "100K", landmark: "Red Deer River Canyon", description: "Red Deer cannabis delivery from Mohawk Medibles. Premium products shipped to central Alberta's hub city via Canada Post Xpresspost.", deliveryTime: "2-3 business days", lat: 52.2681, lng: -113.8112 },
            { slug: "lethbridge", name: "Lethbridge", population: "101K", landmark: "High Level Bridge", description: "Lethbridge cannabis delivery from Mohawk Medibles. Lab-tested flower, edibles, and concentrates shipped to southern Alberta's largest city.", deliveryTime: "3-4 business days", lat: 49.6935, lng: -112.8418 },
            { slug: "medicine-hat", name: "Medicine Hat", population: "63K", landmark: "Saamis Teepee", description: "Medicine Hat cannabis delivery from Mohawk Medibles. Premium products shipped to the Gas City and southeastern Alberta.", deliveryTime: "3-4 business days", lat: 50.0405, lng: -110.6764 },
            { slug: "grande-prairie", name: "Grande Prairie", population: "63K", landmark: "Philip J. Currie Museum", description: "Grande Prairie cannabis delivery from Mohawk Medibles. Premium lab-tested products shipped to the Peace Region and northwestern Alberta.", deliveryTime: "3-4 business days", lat: 55.1707, lng: -118.7948 },
            { slug: "airdrie", name: "Airdrie", population: "73K", landmark: "Nose Creek Park", description: "Airdrie cannabis delivery from Mohawk Medibles. Fast delivery to this growing Calgary-area community with premium, lab-tested products.", deliveryTime: "2-3 business days", lat: 51.2917, lng: -114.0144 },
        ],
    },
    {
        slug: "manitoba",
        name: "Manitoba",
        abbreviation: "MB",
        legalAge: 19,
        deliveryTime: "2-4 business days",
        legacySlug: "manitoba-delivery",
        cities: [
            { slug: "winnipeg", name: "Winnipeg", population: "749K", landmark: "The Forks", description: "Winnipeg, Manitoba's capital, trusts Mohawk Medibles for premium cannabis delivery. Lab-tested flower, edibles, concentrates, and hash shipped to the heart of the prairies.", deliveryTime: "2-3 business days", lat: 49.8951, lng: -97.1384 },
            { slug: "brandon", name: "Brandon", population: "51K", landmark: "Assiniboine River", description: "Brandon cannabis delivery from Mohawk Medibles. Premium products shipped to Manitoba's Wheat City and southwestern Manitoba.", deliveryTime: "3-4 business days", lat: 49.8420, lng: -99.9530 },
            { slug: "steinbach", name: "Steinbach", population: "17K", landmark: "Mennonite Heritage Village", description: "Steinbach and southeastern Manitoba cannabis delivery from Mohawk Medibles. Premium lab-tested products shipped via Canada Post Xpresspost.", deliveryTime: "2-3 business days", lat: 49.5258, lng: -96.6839 },
            { slug: "thompson", name: "Thompson", population: "13K", landmark: "Spirit Way Trail", description: "Thompson, Northern Manitoba's hub city, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the Hub of the North.", deliveryTime: "4-5 business days", lat: 55.7435, lng: -97.8558 },
        ],
    },
    {
        slug: "saskatchewan",
        name: "Saskatchewan",
        abbreviation: "SK",
        legalAge: 19,
        deliveryTime: "2-4 business days",
        legacySlug: "saskatchewan-delivery",
        cities: [
            { slug: "saskatoon", name: "Saskatoon", population: "266K", landmark: "University Bridge", description: "Saskatoon, the Bridge City, trusts Mohawk Medibles for premium cannabis delivery. Lab-tested flower, edibles, and concentrates shipped across the prairies.", deliveryTime: "2-3 business days", lat: 52.1332, lng: -106.6700 },
            { slug: "regina", name: "Regina", population: "226K", landmark: "Wascana Centre", description: "Regina, Saskatchewan's capital, enjoys premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the Queen City and southern Saskatchewan.", deliveryTime: "2-3 business days", lat: 50.4452, lng: -104.6189 },
            { slug: "prince-albert", name: "Prince Albert", population: "37K", landmark: "Prince Albert National Park", description: "Prince Albert cannabis delivery from Mohawk Medibles. Premium products shipped to central Saskatchewan's Gateway to the North.", deliveryTime: "3-4 business days", lat: 53.2034, lng: -105.7531 },
            { slug: "moose-jaw", name: "Moose Jaw", population: "34K", landmark: "Mac the Moose", description: "Moose Jaw cannabis delivery from Mohawk Medibles. Premium lab-tested products shipped to the Friendly City and southern Saskatchewan.", deliveryTime: "2-3 business days", lat: 50.3934, lng: -105.5519 },
        ],
    },
    {
        slug: "nova-scotia",
        name: "Nova Scotia",
        abbreviation: "NS",
        legalAge: 19,
        deliveryTime: "2-4 business days",
        legacySlug: "nova-scotia-delivery",
        cities: [
            { slug: "halifax", name: "Halifax", population: "439K", landmark: "Halifax Citadel", description: "Halifax, Nova Scotia's capital, gets premium cannabis delivery from Mohawk Medibles. Lab-tested flower, edibles, concentrates, and hash shipped to the Maritime hub.", deliveryTime: "2-3 business days", lat: 44.6488, lng: -63.5752 },
            { slug: "sydney", name: "Sydney", population: "29K", landmark: "Big Fiddle", description: "Sydney and Cape Breton cannabis delivery from Mohawk Medibles. Premium lab-tested products shipped to Nova Scotia's eastern communities.", deliveryTime: "3-4 business days", lat: 46.1351, lng: -60.1831 },
            { slug: "dartmouth", name: "Dartmouth", population: "93K", landmark: "Sullivan's Pond", description: "Dartmouth cannabis delivery from Mohawk Medibles. Premium products shipped across Halifax Harbour to the City of Lakes.", deliveryTime: "2-3 business days", lat: 44.6713, lng: -63.5728 },
        ],
    },
    {
        slug: "new-brunswick",
        name: "New Brunswick",
        abbreviation: "NB",
        legalAge: 19,
        deliveryTime: "2-4 business days",
        legacySlug: "new-brunswick-delivery",
        cities: [
            { slug: "moncton", name: "Moncton", population: "79K", landmark: "Magnetic Hill", description: "Moncton cannabis delivery from Mohawk Medibles. Premium lab-tested products shipped to the Hub City and Greater Moncton area.", deliveryTime: "2-3 business days", lat: 46.0878, lng: -64.7782 },
            { slug: "saint-john", name: "Saint John", population: "69K", landmark: "Reversing Falls", description: "Saint John cannabis delivery from Mohawk Medibles. Premium flower, edibles, and concentrates shipped to New Brunswick's port city.", deliveryTime: "2-3 business days", lat: 45.2733, lng: -66.0633 },
            { slug: "fredericton", name: "Fredericton", population: "63K", landmark: "Beaverbrook Art Gallery", description: "Fredericton, New Brunswick's capital, trusts Mohawk Medibles for premium cannabis delivery. Lab-tested products shipped to the River City.", deliveryTime: "2-3 business days", lat: 45.9636, lng: -66.6431 },
            { slug: "miramichi", name: "Miramichi", population: "17K", landmark: "Miramichi River", description: "Miramichi cannabis delivery from Mohawk Medibles. Premium products shipped to northeastern New Brunswick via Canada Post.", deliveryTime: "3-4 business days", lat: 47.0289, lng: -65.5002 },
        ],
    },
    {
        slug: "newfoundland-and-labrador",
        name: "Newfoundland & Labrador",
        abbreviation: "NL",
        legalAge: 19,
        deliveryTime: "3-5 business days",
        legacySlug: "new-foundland-labrador-delivery",
        cities: [
            { slug: "st-johns", name: "St. John's", population: "110K", landmark: "Signal Hill", description: "St. John's, Newfoundland's capital, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to North America's easternmost city.", deliveryTime: "3-4 business days", lat: 47.5615, lng: -52.7126 },
            { slug: "mount-pearl", name: "Mount Pearl", population: "23K", landmark: "Mount Pearl Glacier Arena", description: "Mount Pearl cannabis delivery from Mohawk Medibles. Fast shipping to the St. John's metro area with premium lab-tested products.", deliveryTime: "3-4 business days", lat: 47.5189, lng: -52.8057 },
            { slug: "corner-brook", name: "Corner Brook", population: "19K", landmark: "Marble Mountain", description: "Corner Brook cannabis delivery from Mohawk Medibles. Premium products shipped to western Newfoundland's largest city.", deliveryTime: "3-5 business days", lat: 48.9500, lng: -57.9500 },
        ],
    },
    {
        slug: "prince-edward-island",
        name: "Prince Edward Island",
        abbreviation: "PE",
        legalAge: 19,
        deliveryTime: "2-4 business days",
        legacySlug: "prince-edward-island-delivery",
        cities: [
            { slug: "charlottetown", name: "Charlottetown", population: "38K", landmark: "Province House", description: "Charlottetown, PEI's capital and birthplace of Confederation, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the Gentle Island.", deliveryTime: "2-3 business days", lat: 46.2382, lng: -63.1311 },
            { slug: "summerside", name: "Summerside", population: "15K", landmark: "Spinnaker's Landing", description: "Summerside cannabis delivery from Mohawk Medibles. Premium products shipped to PEI's second-largest city and western Prince County.", deliveryTime: "2-3 business days", lat: 46.3934, lng: -63.7902 },
        ],
    },
    {
        slug: "northwest-territories",
        name: "Northwest Territories",
        abbreviation: "NT",
        legalAge: 19,
        deliveryTime: "4-7 business days",
        legacySlug: "northwest-territories-delivery",
        cities: [
            { slug: "yellowknife", name: "Yellowknife", population: "20K", landmark: "Old Town Rock", description: "Yellowknife, capital of the Northwest Territories, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the Diamond Capital of North America.", deliveryTime: "4-6 business days", lat: 62.4540, lng: -114.3718 },
            { slug: "hay-river", name: "Hay River", population: "3.7K", landmark: "Great Slave Lake", description: "Hay River cannabis delivery from Mohawk Medibles. Premium products shipped to the Hub of the North on the shores of Great Slave Lake.", deliveryTime: "5-7 business days", lat: 60.8164, lng: -115.7131 },
        ],
    },
    {
        slug: "nunavut",
        name: "Nunavut",
        abbreviation: "NU",
        legalAge: 19,
        deliveryTime: "5-10 business days",
        legacySlug: "nunavut-delivery",
        cities: [
            { slug: "iqaluit", name: "Iqaluit", population: "7.4K", landmark: "Nunavut Legislative Assembly", description: "Iqaluit, Nunavut's capital, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to Canada's newest territory capital.", deliveryTime: "5-8 business days", lat: 63.7467, lng: -68.5170 },
            { slug: "rankin-inlet", name: "Rankin Inlet", population: "2.8K", landmark: "Marble Island", description: "Rankin Inlet cannabis delivery from Mohawk Medibles. Premium products shipped to the Kivalliq Region's largest community.", deliveryTime: "7-10 business days", lat: 62.8091, lng: -92.0853 },
        ],
    },
    {
        slug: "yukon",
        name: "Yukon",
        abbreviation: "YT",
        legalAge: 19,
        deliveryTime: "4-7 business days",
        legacySlug: "yukon-delivery",
        cities: [
            { slug: "whitehorse", name: "Whitehorse", population: "28K", landmark: "SS Klondike", description: "Whitehorse, Yukon's capital, gets premium cannabis delivery from Mohawk Medibles. Lab-tested products shipped to the Wilderness City via Canada Post.", deliveryTime: "4-6 business days", lat: 60.7212, lng: -135.0568 },
            { slug: "dawson-city", name: "Dawson City", population: "1.4K", landmark: "Klondike Gold Rush Sites", description: "Dawson City cannabis delivery from Mohawk Medibles. Premium products shipped to the heart of the Klondike via Canada Post.", deliveryTime: "5-7 business days", lat: 64.0600, lng: -139.4320 },
        ],
    },
];

// ─── Helper Functions ───────────────────────────────────────

export function getAllProvinces(): ProvinceData[] {
    return PROVINCES;
}

export function getProvince(slug: string): ProvinceData | undefined {
    return PROVINCES.find((p) => p.slug === slug);
}

export function getCity(provinceSlug: string, citySlug: string): { province: ProvinceData; city: CityData } | undefined {
    const province = getProvince(provinceSlug);
    if (!province) return undefined;
    const city = province.cities.find((c) => c.slug === citySlug);
    if (!city) return undefined;
    return { province, city };
}

export function getAllCities(): { province: ProvinceData; city: CityData }[] {
    return PROVINCES.flatMap((province) =>
        province.cities.map((city) => ({ province, city }))
    );
}

export function getTotalCityCount(): number {
    return PROVINCES.reduce((sum, p) => sum + p.cities.length, 0);
}

export function getPopularCities(): { province: ProvinceData; city: CityData }[] {
    const popularSlugs = [
        "ontario/toronto", "british-columbia/vancouver", "quebec/montreal",
        "alberta/calgary", "alberta/edmonton", "ontario/ottawa",
        "manitoba/winnipeg", "nova-scotia/halifax", "british-columbia/victoria",
        "saskatchewan/saskatoon", "ontario/hamilton", "quebec/quebec-city",
    ];
    return popularSlugs
        .map((key) => {
            const [pSlug, cSlug] = key.split("/");
            return getCity(pSlug, cSlug);
        })
        .filter((r): r is { province: ProvinceData; city: CityData } => r !== undefined);
}

/** City-specific FAQ data */
export function getCityFaqs(cityName: string, provinceName: string, legalAge: number, deliveryTime: string) {
    return [
        { question: `Do you deliver cannabis to ${cityName}?`, answer: `Yes! Mohawk Medibles delivers premium cannabis to ${cityName}, ${provinceName} via Canada Post Xpresspost. Orders typically arrive within ${deliveryTime} with full tracking and discreet packaging.` },
        { question: `How much does delivery cost to ${cityName}?`, answer: `Shipping to ${cityName} is free for orders over $150 CAD. For orders under $150, a flat shipping fee applies. All orders include Canada Post tracking.` },
        { question: `What is the legal age to buy cannabis in ${cityName}?`, answer: `The legal age to purchase cannabis in ${provinceName} is ${legalAge}+. You must be of legal age to order from Mohawk Medibles.` },
        { question: `Is cannabis packaging discreet when shipping to ${cityName}?`, answer: `Absolutely. All orders to ${cityName} ship in plain, unmarked boxes with no cannabis branding or indication of contents. Products are vacuum-sealed for freshness and odour control.` },
        { question: `What payment methods do you accept for ${cityName} orders?`, answer: `We accept Interac e-Transfer, Visa, Mastercard, and cryptocurrency for orders shipped to ${cityName} and all Canadian locations.` },
    ];
}
