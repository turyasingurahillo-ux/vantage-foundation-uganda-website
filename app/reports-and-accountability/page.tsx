import type { Metadata } from "next";
import { getPublishedReports } from "@/content/reports";
import { getPublishedDocuments } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, FileCheck, Scale, Shield, BarChart3, Mail } from "lucide-react";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Reports & Accountability",
  description: "Publication status, approved reports, safeguarding information and accountability commitments from Vantage Foundation Uganda.",
  path: "/reports-and-accountability",
});

// Lets an admin publish a new report via /admin/media without a code
// deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

/** A sectioned empty-state card for a report category with no approved documents yet. */
function EmptyReportSection({
  icon: Icon,
  title,
  description,
  status = "Pending approval",
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  status?: string;
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

export default async function ReportsPage() {
  // Static reports plus anything an admin has since uploaded via
  // /admin/media (newest uploads first).
  const uploaded = await getPublishedDocuments();
  const reports = [...uploaded, ...getPublishedReports()];

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Reports & Accountability"
            description="Transparency is how we build trust with communities, donors and partners."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          {/* Approved reports (if any) */}
          {reports.length > 0 && (
            <>
              <SectionHeader
                align="left"
                title="Approved reports"
                description="Documents cleared for public release, with their reporting period and type."
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
                        Download
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Sectioned report categories with honest empty states */}
          <div className="mt-12">
            <SectionHeader
              align="left"
              title="Publication status by category"
              description="We do not present unfinished documents as published evidence. Each section below shows its current status and what will appear there when approved."
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <EmptyReportSection
                icon={FileCheck}
                title="Annual reports"
                description="Yearly summaries of our programmes, reach and organisational development. The first annual report will be published here once approved for public release."
              />
              <EmptyReportSection
                icon={BarChart3}
                title="Financial reports"
                description="Income and expenditure statements showing how donations are used. As a 100% volunteer-run organisation, funds go directly to programmes. Financial statements will be added after formal approval."
              />
              <EmptyReportSection
                icon={FileText}
                title="Project reports"
                description="Detailed reports from individual projects — including activities, outcomes and lessons learned. Project-level documentation is linked from each project page as it becomes available."
                status="Linked from project pages"
              />
              <EmptyReportSection
                icon={Shield}
                title="Safeguarding"
                description="Our safeguarding policy sets out how we protect children, young people and vulnerable adults across all programmes. The policy is being finalised for publication."
              />
              <EmptyReportSection
                icon={Scale}
                title="Governance"
                description="Vantage Foundation Uganda is led by a published volunteer leadership team and is working towards a formal board structure. Governance documents will be added here only after approval."
              />
              <EmptyReportSection
                icon={BarChart3}
                title="Monitoring & evaluation"
                description="Our approach to measuring impact combines quantitative counts (patients treated, litres of water provided, workshop attendance) with qualitative case studies and community feedback."
                status="Framework in place"
              />
            </div>
          </div>

          {/* Policies */}
          <div className="mt-16">
            <SectionHeader
              align="left"
              title="Policies"
              description="Our public policy commitments are available now. Formal policy documents will be linked as they are approved."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/safeguarding" variant="outline" size="sm">
                Safeguarding
              </Button>
              <Button href="/privacy" variant="outline" size="sm">
                Privacy
              </Button>
              <Button href="/accessibility" variant="outline" size="sm">
                Accessibility
              </Button>
              <Button href="/terms" variant="outline" size="sm">
                Terms
              </Button>
            </div>
          </div>

          {/* Request information */}
          <div className="mt-16">
            <Card className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                <h2 className="text-xl font-bold">Request information</h2>
                <p className="mt-1 max-w-2xl text-muted-foreground">
                  We welcome requests for information from donors, partners,
                  journalists and community members. Reach out and we will
                  respond as soon as possible.
                </p>
                </div>
              </div>
              <Button href="/contact" className="shrink-0">
                Contact us
              </Button>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
