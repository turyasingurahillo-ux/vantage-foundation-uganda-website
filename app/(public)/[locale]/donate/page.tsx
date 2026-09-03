import type { Metadata } from "next";
import { suggestedAmounts } from "@/content/donate";
import { site } from "@/content/site";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DonationForm } from "@/components/shared/DonationForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { CopyBankDetails } from "@/components/shared/CopyBankDetails";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { engagementContent } from "@/lib/i18n/content/engagement";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = engagementContent[locale].donate;
  return createPublicMetadata({
    title: content.title,
    description: content.description,
    path: "/donate",
    locale,
    contentLocalized: true,
  });
}

export default async function DonatePage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const content = engagementContent[locale].donate;

  const donationFaq = engagementContent[locale].faq.items.filter(
    (item) => item.donationRelated,
  );

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={content.heroTitle}
            description={content.heroDescription}
            light
          />
        </Container>
      </section>

      {/* Why give + donation form */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{content.whyTitle}</h2>
              <ul className="mt-6 space-y-4">
                {content.whyReasons.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Donation priorities */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold">{content.allocationTitle}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {content.allocationDescription}
                </p>
                <ul className="mt-4 space-y-2">
                  {content.campaigns.map((campaign) => (
                    <li
                      key={campaign.id}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {campaign.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bank transfer details */}
              <div className="mt-10 rounded-xl bg-surface p-6">
                <h3 className="text-lg font-semibold">{content.bank.heading}</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{content.bank.bank}</dt>
                    <dd className="font-medium">{site.bankDetails.bankName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{content.bank.accountName}</dt>
                    <dd className="font-medium">{site.bankDetails.accountName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{content.bank.accountNumber}</dt>
                    <dd className="font-medium">{site.bankDetails.accountNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{content.bank.swift}</dt>
                    <dd className="font-medium">{site.bankDetails.swiftCode}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <CopyBankDetails copy={content.bank} />
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <p>{content.transparencyNote}</p>
              </div>
            </div>

            {/* Donation form */}
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold">{content.formTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {content.formDescription}
              </p>
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
                {content.pendingNoticeLead}
                <strong>{content.pendingNoticeStrong}</strong>
                {content.pendingNoticeTail}
              </div>
              <div className="mt-6">
                <DonationForm
                  form={content.form}
                  campaigns={content.campaigns}
                  suggestedAmounts={suggestedAmounts}
                  privacyLabel={dictionary.common.privacy}
                  locale={locale}
                />
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* How it works — step by step */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            eyebrow={content.stepsEyebrow}
            title={content.stepsTitle}
            description={content.stepsDescription}
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {content.steps.map((step) => (
              <div key={step.step}>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Transparency */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeader
              eyebrow={content.transparencyEyebrow}
              title={content.transparencyTitle}
              description={content.transparencyDescription}
            />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {content.transparencyStats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href={localePath("/reports-and-accountability", locale)} variant="outline">
              {content.reportsCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Donation FAQ */}
      {donationFaq.length > 0 && (
        <section className="bg-surface py-16 md:py-24">
          <Container className="max-w-3xl">
            <SectionHeader
              align="left"
              title={content.faqTitle}
              description={content.faqDescription}
            />
            <div className="mt-8 space-y-4">
              {donationFaq.map((item, index) => {
                const summaryId = `donate-faq-summary-${index}`;
                const contentId = `donate-faq-content-${index}`;
                return (
                  <details
                    key={item.id}
                    className="group rounded-xl border border-border bg-white p-6 open:shadow-sm"
                  >
                    <summary
                      id={summaryId}
                      className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold"
                    >
                      {item.question}
                      <span className="ml-4 text-primary transition-transform group-open:rotate-180" aria-hidden="true">
                        &#x25BC;
                      </span>
                    </summary>
                    <p
                      id={contentId}
                      aria-labelledby={summaryId}
                      className="mt-4 leading-relaxed text-muted-foreground"
                    >
                      {item.answer}
                    </p>
                  </details>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Contact */}
      <section className="py-16 md:py-24">
        <Container>
          <Card className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h2 className="text-xl font-bold">{content.contactTitle}</h2>
              <p className="mt-1 text-muted-foreground">
                {content.contactDescription}
              </p>
            </div>
            <Button href={localePath("/contact", locale)} className="shrink-0">
              {content.contactCta}
            </Button>
          </Card>
        </Container>
      </section>
    </>
  );
}
