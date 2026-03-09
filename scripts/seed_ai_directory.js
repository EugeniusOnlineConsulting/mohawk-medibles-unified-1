#!/usr/bin/env node
/**
 * Seed AI Directory Data
 * Populates the database with initial city pages and sample dispensaries
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const canadianCities = [
  { city: 'Toronto', province: 'ON', population: 2930000 },
  { city: 'Ottawa', province: 'ON', population: 1050000 },
  { city: 'Hamilton', province: 'ON', population: 579000 },
  { city: 'London', province: 'ON', population: 422000 },
  { city: 'Kitchener', province: 'ON', population: 256000 },
  { city: 'Windsor', province: 'ON', population: 234000 },
  { city: 'Vancouver', province: 'BC', population: 675000 },
  { city: 'Victoria', province: 'BC', population: 92000 },
  { city: 'Kelowna', province: 'BC', population: 144000 },
  { city: 'Surrey', province: 'BC', population: 600000 },
  { city: 'Calgary', province: 'AB', population: 1300000 },
  { city: 'Edmonton', province: 'AB', population: 1050000 },
  { city: 'Lethbridge', province: 'AB', population: 106000 },
  { city: 'Red Deer', province: 'AB', population: 105000 },
  { city: 'Montreal', province: 'QC', population: 1780000 },
  { city: 'Quebec City', province: 'QC', population: 553000 },
  { city: 'Laval', province: 'QC', population: 438000 },
  { city: 'Gatineau', province: 'QC', population: 291000 },
  { city: 'Winnipeg', province: 'MB', population: 778000 },
  { city: 'Brandon', province: 'MB', population: 52000 },
  { city: 'Saskatoon', province: 'SK', population: 273000 },
  { city: 'Regina', province: 'SK', population: 226000 },
  { city: 'Halifax', province: 'NS', population: 431000 },
  { city: 'Dartmouth', province: 'NS', population: 72000 },
];

async function generateCityContent(city, province) {
  const provinceNames = {
    'ON': 'Ontario',
    'BC': 'British Columbia', 
    'AB': 'Alberta',
    'QC': 'Quebec',
    'MB': 'Manitoba',
    'SK': 'Saskatchewan',
    'NS': 'Nova Scotia'
  };
  
  const legalAge = province === 'QC' ? 21 : 19;
  const possessLimit = province === 'QC' ? 150 : 30;
  
  return {
    city,
    province,
    slug: `${province.toLowerCase()}/${city.toLowerCase().replace(/ /g, '-')}`,
    content: `<p>Welcome to ${city}, ${provinceNames[province]}! Find the best licensed cannabis dispensaries in ${city}. Our AI-powered directory features real-time pricing, verified reviews, and exclusive deals from local retailers.</p>

<h3>Cannabis Laws in ${provinceNames[province]}</h3>
<p>In ${provinceNames[province]}, cannabis is legal for adults ${legalAge}+. You can possess up to ${possessLimit} grams of dried cannabis in public. Retail sales are regulated by the provincial government, with both government-operated and private retailers available.</p>

<h3>Delivery Services in ${city}</h3>
<p>Many dispensaries in ${city} offer same-day delivery services. Browse our directory to find retailers that deliver to your area. Most delivery services operate 7 days a week with competitive pricing.</p>

<h3>Indigenous-Owned Dispensaries</h3>
<p>We proudly feature Indigenous-owned and First Nations-operated dispensaries in ${city}. These businesses operate under Indigenous sovereignty and often offer unique products and competitive prices.</p>`,
    faq: JSON.stringify([
      {
        question: `Is cannabis legal in ${city}?`,
        answer: `Yes, cannabis is legal in ${city}, ${provinceNames[province]} for adults ${legalAge} and older. You must purchase from licensed retailers.`
      },
      {
        question: `Where can I buy cannabis in ${city}?`,
        answer: `You can buy cannabis from licensed dispensaries listed in our directory. Many offer both in-store shopping and delivery services.`
      },
      {
        question: `What are the possession limits in ${provinceNames[province]}?`,
        answer: `Adults ${legalAge}+ can possess up to ${possessLimit} grams of dried cannabis in public.`
      },
      {
        question: `Are there Indigenous-owned dispensaries in ${city}?`,
        answer: `Yes, ${city} has several Indigenous-owned and First Nations-operated dispensaries. These are highlighted in our directory with the 🪶 symbol.`
      },
      {
        question: `Does ${city} have cannabis delivery?`,
        answer: `Yes, many dispensaries in ${city} offer same-day delivery. Check individual listings for delivery zones and minimum orders.`
      }
    ]),
    metaTitle: `Cannabis Dispensaries in ${city}, ${province} | Delivery & Pickup`,
    metaDescription: `Find the best cannabis dispensaries in ${city}, ${province}. Browse ${Math.floor(Math.random() * 50 + 20)}+ licensed retailers, compare prices, read reviews, and order online for delivery or pickup.`,
    keywords: [`${city} cannabis`, `${city} dispensary`, `${city} weed delivery`, `${province} marijuana`, 'indigenous owned'],
    dispensaryCount: Math.floor(Math.random() * 50 + 20),
    indigenousCount: Math.floor(Math.random() * 10 + 2)
  };
}

async function generateSampleDispensaries(city, province) {
  const dispensaryTypes = [
    { name: `${city} Cannabis Co`, indigenous: false },
    { name: `Green Leaf ${city}`, indigenous: false },
    { name: `High Society ${province}`, indigenous: false },
    { name: `${city} Herbal Remedies`, indigenous: Math.random() > 0.7 },
    { name: `${province} Premium Cannabis`, indigenous: false },
  ];
  
  return dispensaryTypes.map((type, idx) => ({
    name: type.name,
    slug: `${type.name.toLowerCase().replace(/ /g, '-')}-${city.toLowerCase().replace(/ /g, '-')}`,
    description: `${type.name} is a licensed cannabis retailer in ${city}, ${province}. We offer a wide selection of premium flowers, edibles, concentrates, and accessories. ${type.indigenous ? 'Proudly Indigenous-owned and operated.' : ''}`,
    descriptionAi: `${type.name} offers quality cannabis products in ${city}. Browse our selection of flowers, edibles, and concentrates. ${type.indigenous ? 'As an Indigenous-owned business, we prioritize community wellness and cultural values.' : 'Our knowledgeable staff can help you find the perfect product for your needs.'}`,
    address: `${100 + idx * 50} Main Street, ${city}`,
    city,
    province,
    postalCode: `${['M', 'V', 'T', 'H', 'K', 'S', 'B'][Math.floor(Math.random() * 7)]}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 9)}${['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X', 'Y'][Math.floor(Math.random() * 18)]}${Math.floor(Math.random() * 9)}`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    email: `info@${type.name.toLowerCase().replace(/ /g, '')}.ca`,
    website: `https://www.${type.name.toLowerCase().replace(/ /g, '')}.ca`,
    isIndigenousOwned: type.indigenous,
    isFirstNations: type.indigenous,
    isLicensed: true,
    licenseNumber: `AGCO-${Math.floor(Math.random() * 1000000)}`,
    averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 200 + 10),
    aiConfidence: 0.85,
    metaTitle: `${type.name} | ${city} Cannabis Dispensary`,
    metaDescription: `Visit ${type.name} in ${city} for premium cannabis. Browse our selection of flowers, edibles, and concentrates. Order online for delivery or pickup.`,
    keywords: [`${city} cannabis`, 'dispensary', 'marijuana', 'weed', type.indigenous ? 'indigenous owned' : ''],
  }));
}

async function main() {
  console.log('🌿 Seeding Mohawk Medibles AI Directory...\n');
  
  try {
    // Clear existing data (optional - comment out if you want to keep existing)
    console.log('Clearing existing AI directory data...');
    await prisma.dispensaryReview.deleteMany();
    await prisma.dispensaryProduct.deleteMany();
    await prisma.businessHours.deleteMany();
    await prisma.dispensaryImage.deleteMany();
    await prisma.dispensary.deleteMany();
    await prisma.aiFaq.deleteMany();
    await prisma.cityPage.deleteMany();
    console.log('✓ Cleared existing data\n');
    
    // Seed city pages
    console.log('Creating city pages...');
    for (const cityData of canadianCities) {
      const cityContent = await generateCityContent(cityData.city, cityData.province);
      
      await prisma.cityPage.create({
        data: cityContent
      });
      
      console.log(`  ✓ ${cityData.city}, ${cityData.province}`);
    }
    console.log(`✓ Created ${canadianCities.length} city pages\n`);
    
    // Seed sample dispensaries
    console.log('Creating sample dispensaries...');
    let dispensaryCount = 0;
    
    for (const cityData of canadianCities.slice(0, 10)) { // Only first 10 cities for sample data
      const dispensaries = await generateSampleDispensaries(cityData.city, cityData.province);
      
      for (const dispensary of dispensaries) {
        await prisma.dispensary.create({
          data: {
            ...dispensary,
            hours: {
              create: [
                { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00', isClosed: false },
                { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isClosed: false },
                { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isClosed: false },
                { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isClosed: false },
                { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isClosed: false },
                { dayOfWeek: 5, openTime: '09:00', closeTime: '22:00', isClosed: false },
                { dayOfWeek: 6, openTime: '10:00', closeTime: '22:00', isClosed: false },
              ]
            }
          }
        });
        dispensaryCount++;
      }
    }
    console.log(`✓ Created ${dispensaryCount} dispensaries\n`);
    
    // Create AI automation log
    await prisma.aIAutomationLog.create({
      data: {
        agentName: 'seed_script',
        action: 'initial_data_seed',
        status: 'success',
        details: {
          citiesCreated: canadianCities.length,
          dispensariesCreated: dispensaryCount
        },
        itemCount: canadianCities.length + dispensaryCount
      }
    });
    
    console.log('=================================');
    console.log('✅ Seeding Complete!');
    console.log('=================================');
    console.log(`📍 Cities: ${canadianCities.length}`);
    console.log(`🏪 Dispensaries: ${dispensaryCount}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/directory');
    console.log('3. Start AI agents: python3 agents/directory_ai_agent.py');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
