"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function PrivacyClient() {
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
                <h1 className="text-4xl font-bold text-foreground mb-2">{t("privacyPolicy.title")}</h1>
                <p className="text-sm text-muted-foreground mb-10">{t("privacyPolicy.lastUpdated")}</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.whoWeAreTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacyPolicy.whoWeAreDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.infoCollectTitle")}</h2>
                        <p className="text-muted-foreground"><strong>{t("privacyPolicy.infoYouProvide")}</strong></p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>{t("privacyPolicy.infoYouProvide1")}</li>
                            <li>{t("privacyPolicy.infoYouProvide2")}</li>
                            <li>{t("privacyPolicy.infoYouProvide3")}</li>
                            <li>{t("privacyPolicy.infoYouProvide4")}</li>
                            <li>{t("privacyPolicy.infoYouProvide5")}</li>
                        </ul>
                        <p className="text-muted-foreground mt-3"><strong>{t("privacyPolicy.infoAutoCollected")}</strong></p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>{t("privacyPolicy.infoAutoCollected1")}</li>
                            <li>{t("privacyPolicy.infoAutoCollected2")}</li>
                            <li>{t("privacyPolicy.infoAutoCollected3")}</li>
                            <li>{t("privacyPolicy.infoAutoCollected4")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.howWeUseTitle")}</h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>{t("privacyPolicy.howWeUse1")}</li>
                            <li>{t("privacyPolicy.howWeUse2")}</li>
                            <li>{t("privacyPolicy.howWeUse3")}</li>
                            <li>{t("privacyPolicy.howWeUse4")}</li>
                            <li>{t("privacyPolicy.howWeUse5")}</li>
                            <li>{t("privacyPolicy.howWeUse6")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.paymentSecurityTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacyPolicy.paymentSecurityDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.dataSharingTitle")}</h2>
                        <p className="text-muted-foreground">{t("privacyPolicy.dataSharingIntro")}</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>{t("privacyPolicy.dataSharing1")}</li>
                            <li>{t("privacyPolicy.dataSharing2")}</li>
                            <li>{t("privacyPolicy.dataSharing3")}</li>
                            <li>{t("privacyPolicy.dataSharing4")}</li>
                            <li>{t("privacyPolicy.dataSharing5")}</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">{t("privacyPolicy.dataSharingNote")}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.yourRightsTitle")}</h2>
                        <p className="text-muted-foreground">{t("privacyPolicy.yourRightsIntro")}</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>{t("privacyPolicy.yourRights1")}</li>
                            <li>{t("privacyPolicy.yourRights2")}</li>
                            <li>{t("privacyPolicy.yourRights3")}</li>
                            <li>{t("privacyPolicy.yourRights4")}</li>
                            <li>{t("privacyPolicy.yourRights5")}</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">{t("privacyPolicy.yourRightsContact")}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.cookiesTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacyPolicy.cookiesDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.dataRetentionTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacyPolicy.dataRetentionDesc")}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">{t("privacyPolicy.privacyContactTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacyPolicy.privacyContactDesc")}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
