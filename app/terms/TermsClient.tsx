"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function TermsClient() {
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
                <h1 className="text-4xl font-bold text-foreground mb-2">{t("termsOfService.title")}</h1>
                <p className="text-sm text-muted-foreground mb-10">{t("termsOfService.lastUpdated")}</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.acceptanceTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.acceptanceDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.ageRequirementTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.ageRequirementDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.sovereigntyTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.sovereigntyDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.productsQualityTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.productsQualityDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.ordersPaymentTitle")}</h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>{t("termsOfService.ordersPayment1")}</li>
                            <li>{t("termsOfService.ordersPayment2")}</li>
                            <li>{t("termsOfService.ordersPayment3")}</li>
                            <li>{t("termsOfService.ordersPayment4")}</li>
                            <li>{t("termsOfService.ordersPayment5")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.shippingTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.shippingDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.returnsRefundsTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.returnsRefundsDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.accountTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.accountDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.medAgentTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.medAgentDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.psilocybinTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.psilocybinDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.liabilityTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.liabilityDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("termsOfService.termsContactTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("termsOfService.termsContactDesc")}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
