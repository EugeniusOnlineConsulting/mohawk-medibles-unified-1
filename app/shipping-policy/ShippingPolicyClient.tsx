"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function ShippingPolicyClient() {
    const { t } = useLocale();

    return (
        <div className="relative min-h-screen bg-background">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='currentColor' stroke-width='0.5'%3E%3Cpath d='M40 0L60 20L40 40L20 20Z'/%3E%3Cpath d='M0 40L20 20L40 40L20 60Z'/%3E%3Cpath d='M40 40L60 20L80 40L60 60Z'/%3E%3Cpath d='M40 40L60 60L40 80L20 60Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime/[0.04] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-forest/[0.05] dark:bg-lime/[0.03] rounded-full blur-[100px] -translate-x-1/4" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold text-foreground mb-2">{t("shippingPolicy.title")}</h1>
                <p className="text-sm text-muted-foreground mb-10">{t("shippingPolicy.subtitle")}</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("shippingPolicy.shippingMethodsTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("shippingPolicy.shippingMethodsDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("shippingPolicy.deliveryTimesTitle")}</h2>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl p-4 my-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-green-200 dark:border-green-800/30">
                                        <th className="py-2 text-foreground">{t("shippingPolicy.tableRegion")}</th>
                                        <th className="py-2 text-foreground">{t("shippingPolicy.tableEstimatedDelivery")}</th>
                                        <th className="py-2 text-foreground">{t("shippingPolicy.tableCost")}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground">
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">{t("shippingPolicy.regionLocal")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionLocalTime")}</td>
                                        <td className="py-2 font-semibold text-green-600 dark:text-green-400">{t("shippingPolicy.regionLocalCost")}</td>
                                    </tr>
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">{t("shippingPolicy.regionOntario")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionOntarioTime")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionOntarioCost")}</td>
                                    </tr>
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">{t("shippingPolicy.regionQuebec")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionQuebecTime")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionQuebecCost")}</td>
                                    </tr>
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">{t("shippingPolicy.regionWestern")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionWesternTime")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionWesternCost")}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">{t("shippingPolicy.regionNorthern")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionNorthernTime")}</td>
                                        <td className="py-2">{t("shippingPolicy.regionNorthernCost")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-muted-foreground">
                            {t("shippingPolicy.freeShippingNote")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("shippingPolicy.discreetPackagingTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("shippingPolicy.discreetPackagingDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("shippingPolicy.orderTrackingTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("shippingPolicy.orderTrackingDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("shippingPolicy.ageVerificationTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("shippingPolicy.ageVerificationDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("shippingPolicy.processingTimesTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("shippingPolicy.processingTimesDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("shippingPolicy.lostDamagedTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("shippingPolicy.lostDamagedDesc")}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
