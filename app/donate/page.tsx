import type { Metadata } from "next";
import { site } from "@/content/site";
import { whyDonate, donationCampaigns } from "@/content/donate";
import { faq } from "@/content/faq";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DonationForm } from "@/components/shared/DonationForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { CopyBankDetails } from "@/components/shared/CopyBankDetails";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Donate",
  description: "Support Vantage Foundation Uganda by transferring to its official bank account and recording your donation for verification.",
  path: "/donate",
});

export default function DonatePage() {
  // Donation-related FAQ items
  const donationFaq = faq.filter(
    (item) =>
      item.question.toLowerCase().includes("donat") ||
      item.question.toLowerCase().includes("tax") ||
      item.question.toLowerCase().includes("fund"),
  );

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Support our work"
            description="Your donation becomes one more advantage for a young person, family or community."
            light
          />
        </Container>
      </section>

      {/* Why give + donation form */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">Why donate?</h2>
              <ul className="mt-6 space-y-4">
                {whyDonate.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Donation priorities */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold">Where your donation goes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a specific project or let us direct it to where it is needed most.
                </p>
                <ul className="mt-4 space-y-2">
                  {donationCampaigns.map((campaign) => (
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
                <h3 className="text-lg font-semibold">Bank transfer</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Bank</dt>
                    <dd className="font-medium">{site.bankDetails.bankName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Account name</dt>
                    <dd className="font-medium">{site.bankDetails.accountName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Account number</dt>
                    <dd className="font-medium">{site.bankDetails.accountNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">SWIFT/BIC</dt>
                    <dd className="font-medium">{site.bankDetails.swiftCode}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <CopyBankDetails />
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <p>
                  We are 100% volunteer-run and committed to financial transparency. Your
                  details will only be used to process your donation and send a receipt.
                </p>
              </div>
            </div>

            {/* Donation form */}
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold">Make a donation</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in your details, make the transfer, and include the transaction
                reference if you have one.
              </p>
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
                All donations are recorded as <strong>pending</strong> until a Vantage
                administrator verifies the transfer against our official bank statement.
              </div>
              <div className="mt-6">
                <DonationForm />
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* How it works — step by step */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            eyebrow="How it works"
            title="Three simple steps"
            description="From transfer to impact, here is what happens when you donate."
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold">Transfer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Make a bank transfer to our official account using the details above.
                Include a reference if you have one.
              </p>
            </div>
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold">Record</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in the donation form so we can match your transfer and send you a
                confirmation. Your details stay private.
              </p>
            </div>
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold">Verify</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A Vantage administrator verifies your transfer against our bank statement.
                You receive a confirmation and, where possible, an update on how your gift
                was used.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Transparency */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeader
              eyebrow="Transparency"
              title="Where every shilling goes"
              description="As a 100% volunteer-run organisation, donations go directly to programmes — not salaries or overhead."
            />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="mt-2 text-sm text-muted-foreground">Volunteer-run — no paid staff</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-primary">Direct</p>
              <p className="mt-2 text-sm text-muted-foreground">Funds go to programmes, not intermediaries</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-primary">Verified</p>
              <p className="mt-2 text-sm text-muted-foreground">Every donation checked against bank statements</p>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Button href="/reports-and-accountability" variant="outline">
              See our accountability commitments
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
              title="Donation FAQ"
              description="Common questions about giving to Vantage Foundation Uganda."
            />
            <div className="mt-8 space-y-4">
              {donationFaq.map((item, index) => {
                const summaryId = `donate-faq-summary-${index}`;
                const contentId = `donate-faq-content-${index}`;
                return (
                  <details
                    key={index}
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
              <h2 className="text-xl font-bold">Questions about donating?</h2>
              <p className="mt-1 text-muted-foreground">
                We are happy to discuss specific projects, tax-deductibility or partnership
                opportunities.
              </p>
            </div>
            <Button href="/contact?subject=donation" className="shrink-0">
              Contact us
            </Button>
          </Card>
        </Container>
      </section>
    </>
  );
}
