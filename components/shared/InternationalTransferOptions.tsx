import { Building2, ExternalLink, Globe2, ShieldCheck } from "lucide-react";
import { site } from "@/content/site";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { OFFICIAL_TRANSFER_URLS } from "@/lib/donation-transfer";
import { donationTransferCopy } from "@/lib/i18n/content/donation-transfer";
import type { Locale } from "@/lib/i18n/config";

function BeneficiaryDetails({ locale }: { locale: Locale }) {
  const copy = donationTransferCopy[locale];

  return (
    <div className="mt-5 rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {copy.beneficiaryHeading}
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="text-muted-foreground">{copy.bankLabel}</dt>
          <dd className="font-medium">{site.bankDetails.bankName}</dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="text-muted-foreground">{copy.accountNameLabel}</dt>
          <dd className="font-medium">{site.bankDetails.accountName}</dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="text-muted-foreground">{copy.accountNumberLabel}</dt>
          <dd className="font-mono text-xs font-semibold sm:text-sm">
            {site.bankDetails.accountNumber}
          </dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="text-muted-foreground">{copy.swiftLabel}</dt>
          <dd className="font-mono text-xs font-semibold sm:text-sm">
            {site.bankDetails.swiftCode}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function InternationalTransferOptions({ locale }: { locale: Locale }) {
  const copy = donationTransferCopy[locale];

  return (
    <section className="bg-surface py-16 md:py-24">
      <Container>
        <SectionHeader
          eyebrow={copy.sectionEyebrow}
          title={copy.sectionTitle}
          description={copy.sectionDescription}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{copy.directTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.directDescription}
            </p>
            <BeneficiaryDetails locale={locale} />
          </Card>

          <Card className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{copy.remitlyTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.remitlyDescription}
            </p>
            <BeneficiaryDetails locale={locale} />
            <a
              href={OFFICIAL_TRANSFER_URLS.remitly}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.openProvider}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </Card>

          <Card className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{copy.worldRemitTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.worldRemitDescription}
            </p>
            <BeneficiaryDetails locale={locale} />
            <a
              href={OFFICIAL_TRANSFER_URLS.worldremit}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.openProvider}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p>{copy.availabilityNote}</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p>{copy.thirdPartyNote}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
