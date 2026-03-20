"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Package, Truck, Bitcoin, Wallet } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export default function HowToOrderClient() {
    const { t } = useLocale();

    return (
        <div className="relative min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='currentColor' stroke-width='0.5'%3E%3Cpath d='M40 0L60 20L40 40L20 20Z'/%3E%3Cpath d='M0 40L20 20L40 40L20 60Z'/%3E%3Cpath d='M40 40L60 20L80 40L60 60Z'/%3E%3Cpath d='M40 40L60 60L40 80L20 60Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime/[0.04] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-forest/[0.05] dark:bg-lime/[0.03] rounded-full blur-[100px] -translate-x-1/4" />
            </div>

            <div className="relative z-10 container mx-auto px-6 max-w-4xl space-y-20">
                {/* Header / H1 */}
                <section className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase">
                        {t("howToOrder.title")}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t("howToOrder.subtitle")}
                    </p>
                </section>

                {/* 3 Step Cards */}
                <section className="space-y-8">
                    {/* Step 01 */}
                    <div className="glass-card p-8 rounded-2xl border border-border space-y-4">
                        <div className="text-6xl font-bold text-forest/20 dark:text-lime/20">01</div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">{t("howToOrder.step1Title")}</h2>
                            <p className="text-muted-foreground">
                                {t("howToOrder.step1Desc")}
                            </p>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step1Bullet1")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step1Bullet2")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step1Bullet3")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step1Bullet4")}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 02 */}
                    <div className="glass-card p-8 rounded-2xl border border-border space-y-4">
                        <div className="text-6xl font-bold text-forest/20 dark:text-lime/20">02</div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">{t("howToOrder.step2Title")}</h2>
                            <p className="text-muted-foreground">
                                {t("howToOrder.step2Desc")}
                            </p>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step2Bullet1")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step2Bullet2")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step2Bullet3")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step2Bullet4")}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 03 */}
                    <div className="glass-card p-8 rounded-2xl border border-border space-y-4">
                        <div className="text-6xl font-bold text-forest/20 dark:text-lime/20">03</div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">{t("howToOrder.step3Title")}</h2>
                            <p className="text-muted-foreground">
                                {t("howToOrder.step3Desc")}
                            </p>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step3Bullet1")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step3Bullet2")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step3Bullet3")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-forest dark:text-lime mt-1">•</span>
                                    <span>{t("howToOrder.step3Bullet4")}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Payment Methods Section */}
                <section className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-6">{t("howToOrder.paymentMethodsTitle")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Interac e-Transfer */}
                            <div className="glass-card p-6 rounded-xl border border-border text-center space-y-3">
                                <Wallet className="h-10 w-10 text-forest dark:text-lime mx-auto" />
                                <h3 className="font-bold text-foreground">{t("howToOrder.paymentInteracTitle")}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("howToOrder.paymentInteracDesc")}
                                </p>
                            </div>

                            {/* Visa / Mastercard */}
                            <div className="glass-card p-6 rounded-xl border border-border text-center space-y-3">
                                <CreditCard className="h-10 w-10 text-forest dark:text-lime mx-auto" />
                                <h3 className="font-bold text-foreground">{t("howToOrder.paymentVisaTitle")}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("howToOrder.paymentVisaDesc")}
                                </p>
                            </div>

                            {/* Cryptocurrency */}
                            <div className="glass-card p-6 rounded-xl border border-border text-center space-y-3">
                                <Bitcoin className="h-10 w-10 text-forest dark:text-lime mx-auto" />
                                <h3 className="font-bold text-foreground">{t("howToOrder.paymentCryptoTitle")}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("howToOrder.paymentCryptoDesc")}
                                </p>
                            </div>

                            {/* Cash (Local Pickup) */}
                            <div className="glass-card p-6 rounded-xl border border-border text-center space-y-3">
                                <Package className="h-10 w-10 text-forest dark:text-lime mx-auto" />
                                <h3 className="font-bold text-foreground">{t("howToOrder.paymentCashTitle")}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("howToOrder.paymentCashDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Shipping Information Section */}
                <section className="space-y-6 glass-card p-8 rounded-2xl border border-border">
                    <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Truck className="h-8 w-8 text-forest dark:text-lime" />
                        {t("howToOrder.shippingInfoTitle")}
                    </h2>

                    <div className="space-y-4 text-muted-foreground">
                        <div>
                            <h3 className="font-bold text-foreground mb-2">{t("howToOrder.shippingFreeTitle")}</h3>
                            <p>{t("howToOrder.shippingFreeDesc")}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-foreground mb-2">{t("howToOrder.shippingMethodTitle")}</h3>
                            <p>{t("howToOrder.shippingMethodDesc")}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-foreground mb-2">{t("howToOrder.shippingDeliveryTimesTitle")}</h3>
                            <ul className="space-y-1 text-sm ml-4">
                                <li>{t("howToOrder.shippingDeliveryOntario")}</li>
                                <li>{t("howToOrder.shippingDeliveryQuebec")}</li>
                                <li>{t("howToOrder.shippingDeliveryWestern")}</li>
                                <li>{t("howToOrder.shippingDeliveryNorthern")}</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-foreground mb-2">{t("howToOrder.shippingDiscreetTitle")}</h3>
                            <p>{t("howToOrder.shippingDiscreetDesc")}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-foreground mb-2">{t("howToOrder.shippingTrackingTitle")}</h3>
                            <p>{t("howToOrder.shippingTrackingDesc")}</p>
                        </div>
                    </div>
                </section>

                {/* Need Help Section */}
                <section className="glass-card p-8 rounded-2xl border border-border text-center space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">{t("howToOrder.needHelp")}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t("howToOrder.needHelpDesc")}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/faq">
                            <Button variant="outline" className="w-full sm:w-auto">
                                {t("howToOrder.viewFaq")}
                            </Button>
                        </Link>
                        <Link href="/support">
                            <Button variant="outline" className="w-full sm:w-auto">
                                {t("howToOrder.contactSupport")}
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">{t("howToOrder.readyToOrder")}</h2>
                    <p className="text-muted-foreground text-lg">
                        {t("howToOrder.readyToOrderDesc")}
                    </p>
                    <Link href="/shop">
                        <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-forest font-bold px-8">
                            {t("howToOrder.startShopping")}
                        </Button>
                    </Link>
                </section>
            </div>
        </div>
    );
}
