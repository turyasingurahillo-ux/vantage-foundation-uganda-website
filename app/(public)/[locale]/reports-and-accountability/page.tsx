import type { Metadata } from "next";
import { getPublishedReports } from "@/content/reports";
import { getPublishedDocuments } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, FileCheck, Scale, Shield, BarChart3, Mail } from "lucide-react";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale).reports;
  return createPublicMetadata({
    title: p.title,
    description: p.description,
    path: "/reports-and-accountability",
    locale,
    contentLocalized: false,
  });
}

export const revalidate = 3600;

/** A sectioned empty-state card for a report category with no approved documents yet. */
function EmptyReportSection({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {status}
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}

export default async function ReportsPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const d = await getDictionary(locale);
  const p = getPageContent(locale);
  const uploaded = await getPublishedDocuments();
  const reports = [...uploaded, ...getPublishedReports()];

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={p.reports.title}
            description={p.reports.description}
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <p className="rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {d.common.originalLanguageNotice}
          </p>

          {reports.length > 0 && (
            <>
              <SectionHeader
                align="left"
                title={p.reports.approvedReports}
                description={p.reports.approvedDescription}
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <Card key={report.title} className="flex flex-col p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{report.title}</h3>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {report.type} &middot; {report.date}
                    </p>
                    {report.description && (
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    )}
                    {report.url && (
                      <Button href={report.url} variant="outline" className="mt-4" size="sm">
                        {p.reports.download}
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}

          <div className="mt-12">
            <SectionHeader
              align="left"
              title={p.reports.publicationStatus}
              description={p.reports.publicationDescription}
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <EmptyReportSection
                icon={FileCheck}
                title={p.reports.annualReports}
                description={p.reports.annualReportsDescription}
                status={p.reports.emptyStatus}
              />
              <EmptyReportSection
                icon={BarChart3}
                title={p.reports.financialReports}
                description={p.reports.financialReportsDescription}
                status={p.reports.emptyStatus}
              />
              <EmptyReportSection
                icon={FileText}
                title={p.reports.projectReports}
                description={p.reports.projectReportsDescription}
                status={p.reports.projectReportsStatus}
              />
              <EmptyReportSection
                icon={Shield}
                title={p.reports.safeguarding}
                description={p.reports.safeguardingDescription}
                status={p.reports.emptyStatus}
              />
              <EmptyReportSection
                icon={Scale}
                title={p.reports.governance}
                description={p.reports.governanceDescription}
                status={p.reports.emptyStatus}
              />
              <EmptyReportSection
                icon={BarChart3}
                title={p.reports.monitoring}
                description={p.reports.monitoringDescription}
                status={p.reports.monitoringStatus}
              />
            </div>
          </div>

          <div className="mt-16">
            <SectionHeader
              align="left"
              title={p.reports.policies}
              description={p.reports.policiesDescription}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={localePath("/safeguarding", locale)} variant="outline" size="sm">
                {p.legal.safeguarding}
              </Button>
              <Button href={localePath("/privacy", locale)} variant="outline" size="sm">
                {p.legal.privacy}
              </Button>
              <Button href={localePath("/accessibility", locale)} variant="outline" size="sm">
                {p.legal.accessibility}
              </Button>
              <Button href={localePath("/terms", locale)} variant="outline" size="sm">
                {p.legal.terms}
              </Button>
            </div>
          </div>

          <div className="mt-16">
            <Card className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{p.reports.requestInfo}</h2>
                  <p className="mt-1 max-w-2xl text-muted-foreground">
                    {p.reports.requestDescription}
                  </p>
                </div>
              </div>
              <Button href={localePath("/contact", locale)} className="shrink-0">
                {p.reports.contactUs}
              </Button>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
