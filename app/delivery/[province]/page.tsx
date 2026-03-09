/**
 * /delivery/[province] — Dynamic Province-Level Cannabis Delivery Landing Page
 * ═════════════════════════════════════════════════════════════════════════════
 * Renders full-page province delivery experiences with city listings, FAQs,
 * and rich structured data (Store, BreadcrumbList, FAQPage schemas).
 *
 * Server Component (RSC) — params are Promises in Next.js 16
 */

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProvince, getAllProvinces, getCityFaqs } from "@/lib/seo/city-delivery-data";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";
import DeliveryMapLoader from "@/components/DeliveryMapLoader";

// ─── Static Params Generation ────────────────────────────────────────────

export async function generateStaticParams() {
	const provinces = getAllProvinces();
	return provinces.map((province) => ({
		province: province.slug,
	}));
}

// ─── Metadata Generation ────────────────────────────────────────────────

export async function generateMetadata({
	params,
}: {
	params: Promise<{ province: string }>;
}): Promise<Metadata> {
	const { province: provinceSlug } = await params;
	const province = getProvince(provinceSlug);

	if (!province) {
		return {
			title: "Province Not Found | Mohawk Medibles",
			description: "The province you're looking for doesn't exist.",
		};
	}

	const title = `Cannabis Delivery to ${province.name} — Buy Weed Online | Mohawk Medibles`;
	const description = `Premium cannabis delivery to ${province.name}. Lab-tested flower, edibles, concentrates & more. Fast shipping to ${province.cities.length}+ cities. Legal age ${province.legalAge}+.`;
	const canonical = `https://mohawkmedibles.ca/delivery/${province.slug}`;

	return {
		title,
		description,
		alternates: {
			canonical,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url: canonical,
			siteName: "Mohawk Medibles",
			images: [
				{
					url: "https://mohawkmedibles.ca/og-image.png",
					width: 1200,
					height: 630,
					alt: `Cannabis Delivery to ${province.name}`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
		keywords: [
			`cannabis delivery ${province.name.toLowerCase()}`,
			`buy weed online ${province.abbreviation}`,
			`cannabis shop ${province.name.toLowerCase()}`,
			"premium cannabis",
			"lab-tested",
		],
	};
}

// ─── Store Schema (Static, Province-Aware) ────────────────────────────────

function createStoreSchema(provinceName: string) {
	return {
		"@context": "https://schema.org",
		"@type": "Store",
		name: "Mohawk Medibles",
		url: "https://mohawkmedibles.ca",
		image: "https://mohawkmedibles.ca/logo.png",
		description:
			"Indigenous-owned premium cannabis dispensary on Six Nations territory. Lab-tested, terpene-profiled products meeting the Empire Standard™.",
		address: {
			"@type": "PostalAddress",
			streetAddress: "Six Nations of the Grand River",
			addressLocality: "Ohsweken",
			addressRegion: "ON",
			postalCode: "N0A 1M0",
			addressCountry: "CA",
		},
		areaServed: {
			"@type": "State",
			name: provinceName,
		},
		priceRange: "$$",
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer service",
			email: "support@mohawkmedibles.ca",
			availableLanguage: ["English", "French"],
		},
	};
}

// ─── Province FAQ Data ───────────────────────────────────────────────────

function getProvinceFaqs(provinceName: string, provinceAbbr: string, legalAge: number, deliveryTime: string) {
	return [
		{
			question: `Does Mohawk Medibles deliver cannabis to ${provinceName}?`,
			answer: `Yes! Mohawk Medibles delivers premium, lab-tested cannabis to ${provinceName} via Canada Post Xpresspost. We serve ${provinceName} residents with discreet, tracked shipping and full product transparency. Orders typically arrive within ${deliveryTime}.`,
		},
		{
			question: `What is the legal age to buy cannabis in ${provinceName}?`,
			answer: `The legal age to purchase and possess cannabis in ${provinceName} is ${legalAge}+. You must provide valid ID confirming your age to complete your purchase. By ordering from Mohawk Medibles, you certify that you meet your province's legal age requirement.`,
		},
		{
			question: `How long does delivery take to ${provinceName}?`,
			answer: `Delivery to ${provinceName} typically takes ${deliveryTime} with Canada Post Xpresspost. Most urban centers receive orders within 1-2 business days. Remote areas may take 3-5 business days. All orders include full tracking information.`,
		},
	];
}

// ─── Main Server Component ───────────────────────────────────────────────

export default async function ProvinceDeliveryPage({
	params,
}: {
	params: Promise<{ province: string }>;
}) {
	const { province: provinceSlug } = await params;
	const province = getProvince(provinceSlug);

	if (!province) {
		notFound();
	}

	// Generate schemas
	const breadcrumbs = breadcrumbSchema([
		{ name: "Home", url: "https://mohawkmedibles.ca" },
		{ name: "Delivery", url: "https://mohawkmedibles.ca/delivery" },
		{ name: province.name, url: `https://mohawkmedibles.ca/delivery/${province.slug}` },
	]);

	const provinceFaqs = getProvinceFaqs(province.name, province.abbreviation, province.legalAge, province.deliveryTime);
	const faqs = faqSchema(provinceFaqs);

	const storeSchema = createStoreSchema(province.name);

	// Get sibling provinces for navigation
	const allProvinces = getAllProvinces();
	const siblingProvinces = allProvinces.filter((p) => p.slug !== province.slug).slice(0, 5);

	const storeSchemaJson = JSON.stringify(storeSchema);
	const breadcrumbsJson = JSON.stringify(breadcrumbs);
	const faqsJson = JSON.stringify(faqs);

	return (
		<>
			{/* JSON-LD Schemas - Safe JSON serialization */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storeSchemaJson }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbsJson }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqsJson }} />

			<main className="min-h-screen pt-32 pb-20 bg-forest text-cream">
				<div className="container mx-auto px-6">
					{/* Breadcrumb Navigation */}
					<nav className="mb-12 text-sm text-cream/50" aria-label="breadcrumb">
						<div className="flex items-center gap-3">
							<Link href="/" className="hover:text-cream transition-colors">
								Home
							</Link>
							<span>→</span>
							<Link href="/delivery" className="hover:text-cream transition-colors">
								Delivery
							</Link>
							<span>→</span>
							<span className="text-secondary font-medium">{province.name}</span>
						</div>
					</nav>

					{/* Hero Section */}
					<div className="mb-16">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase mb-6 leading-tight">
							Cannabis Delivery in {province.name}
						</h1>
						<p className="text-xl text-cream/90 max-w-2xl leading-relaxed">
							Premium, lab-tested cannabis delivered to your door across {province.name}. Discreet packaging, fast
							shipping, and Empire Standard™ quality guaranteed. Legal age {province.legalAge}+.
						</p>
					</div>

					{/* Stats Section */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
						<div className="glass p-6 rounded-2xl border border-white/10 hover:border-secondary/50 transition-all">
							<div className="text-4xl font-bold text-secondary mb-2">{province.cities.length}+</div>
							<p className="text-cream/80">Cities Served</p>
						</div>
						<div className="glass p-6 rounded-2xl border border-white/10 hover:border-secondary/50 transition-all">
							<div className="text-4xl font-bold text-secondary mb-2">{province.legalAge}+</div>
							<p className="text-cream/80">Legal Age</p>
						</div>
						<div className="glass p-6 rounded-2xl border border-white/10 hover:border-secondary/50 transition-all">
							<div className="text-2xl font-bold text-secondary mb-2">{province.abbreviation}</div>
							<p className="text-cream/80">Province Code</p>
						</div>
						<div className="glass p-6 rounded-2xl border border-white/10 hover:border-secondary/50 transition-all">
							<div className="text-lg font-bold text-secondary mb-2">{province.deliveryTime}</div>
							<p className="text-cream/80">Delivery Time</p>
						</div>
					</div>

					{/* Interactive Province Map */}
				<div className="mb-20">
					<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-white mb-8">
						Delivery Map
					</h2>
					<DeliveryMapLoader
						cities={province.cities.map((city) => ({
							name: city.name,
							provinceName: province.name,
							provinceSlug: province.slug,
							citySlug: city.slug,
							lat: city.lat,
							lng: city.lng,
							population: city.population,
							deliveryTime: city.deliveryTime,
						}))}
						center={[province.cities[0].lat, province.cities[0].lng]}
						zoom={province.cities.length > 5 ? 6 : 5}
						heightClass="h-[400px]"
					/>
				</div>

				{/* Cities Grid Section */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-white mb-12">
							Cities We Deliver To
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{province.cities.map((city) => (
								<Link
									key={city.slug}
									href={`/delivery/${province.slug}/${city.slug}`}
									className="group"
								>
									<div className="glass p-6 rounded-2xl border border-white/10 group-hover:border-secondary/50 transition-all h-full flex flex-col">
										<h3 className="text-2xl font-bold text-white mb-2 group-hover:text-secondary transition-colors">
											{city.name}
										</h3>
										<p className="text-sm text-cream/60 mb-3">📍 {city.landmark}</p>
										<p className="text-cream/80 text-sm mb-4 flex-grow">{city.description}</p>
										<div className="flex items-center justify-between pt-4 border-t border-white/10">
											<span className="text-xs text-cream/60">Pop: {city.population}</span>
											<span className="text-xs text-secondary font-medium">{city.deliveryTime}</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* FAQ Section */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-white mb-12">
							Delivery FAQs
						</h2>
						<div className="space-y-6">
							{provinceFaqs.map((faq, idx) => (
								<details key={idx} className="glass p-6 rounded-2xl border border-white/10 group">
									<summary className="cursor-pointer font-bold text-lg text-white group-hover:text-secondary transition-colors flex items-center justify-between">
										{faq.question}
										<span className="text-secondary transition-transform group-open:rotate-180">↓</span>
									</summary>
									<p className="mt-4 text-cream/80 leading-relaxed">{faq.answer}</p>
								</details>
							))}
						</div>
					</div>

					{/* Other Provinces Section */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-white mb-12">
							Other Provinces
						</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{siblingProvinces.map((prov) => (
								<Link key={prov.slug} href={`/delivery/${prov.slug}`}>
									<div className="glass p-4 rounded-xl border border-white/10 hover:border-secondary/50 transition-all text-center group">
										<p className="font-bold text-white group-hover:text-secondary transition-colors">
											{prov.name}
										</p>
										<p className="text-xs text-cream/60 mt-1">{prov.cities.length} cities</p>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* CTA Section */}
					<div className="glass p-12 rounded-3xl border border-white/10 text-center">
						<h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">
							Ready to Order?
						</h2>
						<p className="text-cream/80 mb-8 max-w-2xl mx-auto">
							Browse our full selection of premium, lab-tested cannabis products and place your order today.
							Fast shipping, discreet packaging, and 100% secure checkout.
						</p>
						<Button asChild variant="brand" size="lg">
							<Link href="/shop">Shop Premium Cannabis</Link>
						</Button>
					</div>
				</div>
			</main>
		</>
	);
}
