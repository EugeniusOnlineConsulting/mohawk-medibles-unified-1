"use client";

const DEALS = [
  { emoji: "🔥", text: "HOME OF THE $5 GRAM" },
  { emoji: "🚚", text: "FREE SHIPPING ON ORDERS $199+" },
  { emoji: "⚡", text: "SAME DAY DELIVERY AVAILABLE" },
  { emoji: "💳", text: "INTERAC • VISA/MC • BITCOIN" },
  { emoji: "🧪", text: "344+ LAB-TESTED PRODUCTS" },
  { emoji: "💰", text: "TAX-FREE ALWAYS" },
  { emoji: "📦", text: "DISCREET, SMELL-PROOF PACKAGING" },
  { emoji: "🏔️", text: "INDIGENOUS OWNED & OPERATED" },
];

export function DealTicker() {
  const items = [...DEALS, ...DEALS]; // duplicate for seamless loop

  return (
    <section aria-label="Current deals and promotions" className="bg-forest dark:bg-charcoal-deep overflow-hidden py-2.5 border-y border-lime/10 relative z-40">
      <div className="flex animate-ticker whitespace-nowrap" aria-live="off">
        {items.map((deal, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs font-bold tracking-[0.15em] uppercase">
            <span aria-hidden="true">{deal.emoji}</span>
            <span className="text-lime-light">{deal.text}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
