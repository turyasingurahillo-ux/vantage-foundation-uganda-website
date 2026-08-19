import type { Metadata } from "next";
import { getPublishedImpactStats, outputs, outcomes, longTermGoals, regions, sdgs } from "@/content/impact";
import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { ImpactMetricList, type ImpactTier } from "@/components/shared/ImpactMetric";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Impact",
  description:
    "See how Vantage Foundation Uganda measures and reports its impact in health, education, humanitarian aid and WASH.",
  path: "/impact",
});

export default function ImpactPage() {
  // Combine the three flat arrays into a single tiered list so the
  // measurement hierarchy (output → outcome → long-term) is explicit.
  const tieredItems: { tier: ImpactTier; text: string }[] = [
    ...outputs.map((text) => ({ tier: "output" as const, text })),
    ...outcomes.map((text) => ({ tier: "outcome" as const, text })),
    ...longTermGoals.map((text) => ({ tier: "long-term" as const, text })),
  ];

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Impact"
            description="Evidence of change, measured with honesty and hope."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {getPublishedImpactStats().map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
            Figures shown above are programme-team records, not independently
            audited results. Each card explains the reporting period and
            counting method and links to the relevant project.
          </p>

          <div className="mt-16">
            <SectionHeader
              align="left"
              title="From outputs to long-term change"
              description="Our work is measured across three levels: what we deliver (outputs), the changes we see (outcomes), and the future we are building (long-term impact)."
            />
            <div className="mt-8">
              <ImpactMetricList items={tieredItems} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">Geographic reach</h2>
              <p className="mt-4 text-muted-foreground">
                We identify districts and communities that are often overlooked by larger
                international NGOs and magnify the reach of existing social safety nets.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {regions.map((region) => (
                  <span
                    key={region}
                    className="rounded-full border border-border bg-white px-3 py-1 text-sm font-medium"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold">Sustainable Development Goals</h2>
              <p className="mt-4 text-muted-foreground">
                Our programmes contribute to the following global goals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {sdgs.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white"
                    title={`SDG ${goal}`}
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            title="Monitoring and evaluation"
            description="We use a dual-metric system to track progress and learn."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary">Quantitative</h3>
              <p className="mt-2 text-muted-foreground">
                Number of patients treated, litres of clean water provided, workshop attendance,
                and reach of mentorship campaigns.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary">Qualitative</h3>
              <p className="mt-2 text-muted-foreground">
                Case studies on livelihood improvements, community feedback on health awareness,
                and reflections from volunteers and beneficiaries.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader title="Projects behind the numbers" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getPublishedProjects().slice(0, 3).map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/projects">View All Projects</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
