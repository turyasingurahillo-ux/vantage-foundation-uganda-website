import type { Story } from "@/types";
import Link from "next/link";
import {
  extractGuideOpening,
  parseOpportunityBoard,
  parseRoadmaps,
  removeLegacyJumpList,
  splitGuideSections,
} from "@/lib/career-guide";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Markdown } from "@/components/shared/Markdown";
import { ArticleCtaBar } from "@/components/shared/ArticleCtaBar";
import { RelatedStories } from "@/components/shared/RelatedStories";
import { GuideNavigation } from "@/components/guides/GuideNavigation";
import { OpportunityBoard } from "@/components/guides/OpportunityBoard";
import {
  CareerAlertsCta,
  CareerGuideHero,
  CareerPathGrid,
  CareerRoadmap,
  FundingCheck,
  GuideQuickStart,
  ManifestoCallout,
  VantageView,
  VerificationPanel,
} from "@/components/guides/GuidePrimitives";

const navigationItems = [
  { id: "start-here", label: "Start here" },
  { id: "1-your-next-30-days", label: "Your next 30 days" },
  {
    id: "2-three-famous-scholarships-that-may-be-wrong-for-your-stage",
    label: "Scholarships to delay",
  },
  {
    id: "3-four-funded-routes-fresh-graduates-should-prepare-for",
    label: "Funded scholarships",
  },
  {
    id: "4-research-jobs-internships-and-entry-level-health-opportunities-in-uganda",
    label: "Uganda opportunities",
  },
  { id: "5-africa-is-not-the-consolation-prize", label: "Africa opportunities" },
  { id: "6-do-not-let-cheap-tuition-mislead-you", label: "Cost of studying abroad" },
  { id: "7-build-skills-that-change-your-cv", label: "Build your skills" },
  { id: "8-choose-a-career-ladder", label: "Career paths" },
  { id: "9-pick-the-roadmap-that-fits-you", label: "Your roadmap" },
  {
    id: "10-build-toward-the-doors-that-are-not-open-yet",
    label: "Build toward later doors",
  },
  {
    id: "11-opportunity-board-14-august-2026",
    label: "Opportunity Board",
  },
  {
    id: "remove-these-from-your-list",
    label: "Not worth applying for yet",
  },
  { id: "frequently-asked-questions", label: "FAQ" },
  { id: "the-vantage-position", label: "Vantage position" },
  { id: "verification-and-corrections", label: "Verification & corrections" },
];

function GuideArticleSection({
  section,
  idPrefix,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
  idPrefix?: string;
}) {
  return (
    <section className="border-t border-border py-10 first:border-t-0 first:pt-0 md:py-14">
      <Markdown variant="guide" idPrefix={idPrefix}>
        {section.markdown}
      </Markdown>
    </section>
  );
}

function FundingSection({
  section,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
}) {
  const marker = "### The Vantage funding rule";
  const formula =
    "> **Tuition + living costs + visa proof of funds + travel − guaranteed scholarship = your real gap**";
  const markerIndex = section.body.indexOf(marker);
  const formulaIndex = section.body.indexOf(formula, markerIndex);

  if (markerIndex < 0 || formulaIndex < 0) return <GuideArticleSection section={section} />;

  const before = section.body.slice(0, markerIndex).trim();
  const after = section.body.slice(formulaIndex + formula.length).trim();

  return (
    <section className="border-t border-border py-10 md:py-14">
      <Markdown variant="guide">{`## ${section.heading}\n\n${before}`}</Markdown>
      <FundingCheck />
      <Markdown variant="guide">{after}</Markdown>
    </section>
  );
}

function RoadmapsSection({
  section,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
}) {
  const { introMarkdown, roadmaps } = parseRoadmaps(section.body);

  return (
    <section
      id={section.id}
      className="scroll-mt-40 border-t border-border py-12 lg:scroll-mt-28 md:py-16"
      aria-labelledby="roadmaps-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
        Six realistic routes
      </p>
      <h2 id="roadmaps-heading" className="mt-2 text-3xl font-bold tracking-tight">
        9. Pick the roadmap that fits you
      </h2>
      {introMarkdown && (
        <div className="mt-4 max-w-2xl">
          <Markdown variant="guide">{introMarkdown}</Markdown>
        </div>
      )}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {roadmaps.map((roadmap) => (
          <CareerRoadmap key={roadmap.id} roadmap={roadmap} />
        ))}
      </div>
    </section>
  );
}

function OpportunitySection({
  section,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
}) {
  const board = parseOpportunityBoard(section.body);
  const groups = board.groups.map((group) => ({
    status: group.status,
    heading: group.heading,
    items: group.opportunities.map((opportunity) => ({
      id: opportunity.id,
      status: opportunity.status,
      type: opportunity.type,
      funding: opportunity.funding,
      content: <Markdown statusBadges>{opportunity.markdown}</Markdown>,
    })),
  }));

  return (
    <OpportunityBoard
      checkedAt={board.checkedAt}
      groups={groups}
      guidance={
        board.guidanceMarkdown ? (
          <Markdown variant="guide">{board.guidanceMarkdown}</Markdown>
        ) : undefined
      }
    />
  );
}

export function BeyondTheWardGuide({
  story,
  relatedStories,
}: {
  story: Story;
  relatedStories: Story[];
}) {
  const { preamble, sections } = splitGuideSections(story.body);
  const opening = extractGuideOpening(preamble);
  const howTo = sections.find((section) => section.id === "how-to-use-this-guide");
  const remainingSections = sections.filter(
    (section) => section.id !== "how-to-use-this-guide"
  );

  return (
    <>
      <div className="border-b border-border bg-white py-4">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Stories & Insights", href: "/stories" },
              { label: story.title },
            ]}
          />
        </Container>
      </div>
      <CareerGuideHero story={story} />

      <div id="career-guide-content" className="py-10 md:py-14">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:gap-14">
            <GuideNavigation items={navigationItems} />

            <article className="min-w-0">
              <GuideQuickStart items={opening.quickStartItems} />

              <section className="py-10 md:py-14" aria-label="Guide introduction">
                <p className="mb-6 border-l-2 border-primary pl-4 text-sm leading-relaxed text-slate-600">
                  Companion analysis:{" "}
                  <Link
                    href="/stories/healers-in-crisis-ugandas-medical-interns"
                    className="font-semibold text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary"
                  >
                    Healers in Crisis: Why Uganda Cannot Afford to Lose Its Young Doctors
                  </Link>
                </p>
                <Markdown variant="guide">{opening.introMarkdown}</Markdown>
              </section>

              {howTo && (
                <section className="border-t border-border py-10 md:py-14">
                  <Markdown variant="guide">
                    {`## ${howTo.heading}\n\n${removeLegacyJumpList(howTo.body)}`}
                  </Markdown>
                </section>
              )}

              <CareerPathGrid />

              {remainingSections.map((section) => {
                if (section.id === "the-white-coat-is-not-a-prison-uniform") {
                  return (
                    <ManifestoCallout key={section.id}>
                      {section.body}
                    </ManifestoCallout>
                  );
                }

                if (section.id === "6-do-not-let-cheap-tuition-mislead-you") {
                  return <FundingSection key={section.id} section={section} />;
                }

                if (section.id === "9-pick-the-roadmap-that-fits-you") {
                  return <RoadmapsSection key={section.id} section={section} />;
                }

                if (section.id === "11-opportunity-board-14-august-2026") {
                  return <OpportunitySection key={section.id} section={section} />;
                }

                if (section.id === "the-vantage-position") {
                  return (
                    <div key={section.id} className="border-t border-border py-12 md:py-16">
                      <VantageView>
                        <Markdown variant="guide">{section.body}</Markdown>
                      </VantageView>
                    </div>
                  );
                }

                if (section.id === "verification-and-corrections") {
                  return (
                    <div key={section.id} className="border-t border-border py-12 md:py-16">
                      <VerificationPanel>
                        <Markdown variant="guide">{section.body}</Markdown>
                      </VerificationPanel>
                    </div>
                  );
                }

                return (
                  <GuideArticleSection
                    key={section.id}
                    section={section}
                    idPrefix={
                      section.id === "frequently-asked-questions" ? "faq" : undefined
                    }
                  />
                );
              })}

              <CareerAlertsCta story={story} />

              <div className="mt-10">
                <ArticleCtaBar slug={story.slug} />
              </div>
            </article>
          </div>

          <RelatedStories stories={relatedStories} />
        </Container>
      </div>
    </>
  );
}
