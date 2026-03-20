"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function ReturnsPolicyClient() {
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
                <h1 className="text-4xl font-bold text-foreground mb-2">{t("returnsPolicy.title")}</h1>
                <p className="text-sm text-muted-foreground mb-10">{t("returnsPolicy.subtitle")}</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("returnsPolicy.eligibilityTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("returnsPolicy.eligibilityDesc")}
                        </p>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl p-4 my-4">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">{t("returnsPolicy.returnsAcceptedTitle")}</h3>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                <li>{t("returnsPolicy.returnsAccepted1")}</li>
                                <li>{t("returnsPolicy.returnsAccepted2")}</li>
                                <li>{t("returnsPolicy.returnsAccepted3")}</li>
                                <li>{t("returnsPolicy.returnsAccepted4")}</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 my-4">
                            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">{t("returnsPolicy.returnsNotAcceptedTitle")}</h3>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                <li>{t("returnsPolicy.returnsNotAccepted1")}</li>
                                <li>{t("returnsPolicy.returnsNotAccepted2")}</li>
                                <li>{t("returnsPolicy.returnsNotAccepted3")}</li>
                                <li>{t("returnsPolicy.returnsNotAccepted4")}</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("returnsPolicy.howToRequestTitle")}</h2>
                        <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                            <li>{t("returnsPolicy.howToRequest1")}</li>
                            <li>{t("returnsPolicy.howToRequest2")}</li>
                            <li>{t("returnsPolicy.howToRequest3")}</li>
                            <li>{t("returnsPolicy.howToRequest4")}</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("returnsPolicy.refundProcessTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("returnsPolicy.refundProcessDesc")}
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li>{t("returnsPolicy.refundFull")}</li>
                            <li>{t("returnsPolicy.refundPartial")}</li>
                            <li>{t("returnsPolicy.refundStoreCredit")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("returnsPolicy.exchangesTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("returnsPolicy.exchangesDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("returnsPolicy.shippingForReturnsTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("returnsPolicy.shippingForReturnsDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("returnsPolicy.contactTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("returnsPolicy.contactDesc")}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
