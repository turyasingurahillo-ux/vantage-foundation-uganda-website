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
import { getPageContent } from "@/lib/i18n/content/pages";
import { localePath, type Locale } from "@/lib/i18n/config";

function GuideArticleSection({
  section,
  idPrefix,
  locale,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
  idPrefix?: string;
  locale?: Locale;
}) {
  return (
    <section className="border-t border-border py-10 first:border-t-0 first:pt-0 md:py-14">
      <Markdown variant="guide" idPrefix={idPrefix} locale={locale}>
        {section.markdown}
      </Markdown>
    </section>
  );
}

function FundingSection({
  section,
  locale,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
  locale?: Locale;
}) {
  const marker = "### The Vantage funding rule";
  const formula =
    "> **Tuition + living costs + visa proof of funds + travel − guaranteed scholarship = your real gap**";
  const markerIndex = section.body.indexOf(marker);
  const formulaIndex = section.body.indexOf(formula, markerIndex);

  if (markerIndex < 0 || formulaIndex < 0) return <GuideArticleSection section={section} locale={locale} />;

  const before = section.body.slice(0, markerIndex).trim();
  const after = section.body.slice(formulaIndex + formula.length).trim();

  return (
    <section className="border-t border-border py-10 md:py-14">
      <Markdown variant="guide" locale={locale}>{`## ${section.heading}\n\n${before}`}</Markdown>
      <FundingCheck />
      <Markdown variant="guide" locale={locale}>{after}</Markdown>
    </section>
  );
}

function RoadmapsSection({
  section,
  locale,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
  locale?: Locale;
}) {
  const { introMarkdown, roadmaps } = parseRoadmaps(section.body);
  const t = getPageContent(locale ?? "en").ui.guide;

  return (
    <section
      id={section.id}
      className="scroll-mt-40 border-t border-border py-12 lg:scroll-mt-28 md:py-16"
      aria-labelledby="roadmaps-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
        {t.roadmapEyebrow}
      </p>
      <h2 id="roadmaps-heading" className="mt-2 text-3xl font-bold tracking-tight">
        {t.roadmapHeading}
      </h2>
      {introMarkdown && (
        <div className="mt-4 max-w-2xl">
          <Markdown variant="guide" locale={locale}>{introMarkdown}</Markdown>
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
  locale,
}: {
  section: ReturnType<typeof splitGuideSections>["sections"][number];
  locale?: Locale;
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
      content: <Markdown statusBadges locale={locale}>{opportunity.markdown}</Markdown>,
    })),
  }));

  return (
    <OpportunityBoard
      checkedAt={board.checkedAt}
      groups={groups}
      guidance={
        board.guidanceMarkdown ? (
          <Markdown variant="guide" locale={locale}>{board.guidanceMarkdown}</Markdown>
        ) : undefined
      }
    />
  );
}

export function BeyondTheWardGuide({
  story,
  relatedStories,
  locale = "en",
}: {
  story: Story;
  relatedStories: Story[];
  locale?: Locale;
}) {
  const resolved = locale ?? "en";
  const c = getPageContent(resolved).common;
  const s = getPageContent(resolved).stories;
  const t = getPageContent(resolved).ui.guide;

  const navigationItems = [
    { id: "start-here", label: t.quickStartEyebrow },
    { id: "1-your-next-30-days", label: t.next30Days },
    {
      id: "2-three-famous-scholarships-that-may-be-wrong-for-your-stage",
      label: t.scholarshipsToDelay,
    },
    {
      id: "3-four-funded-routes-fresh-graduates-should-prepare-for",
      label: t.fundedScholarships,
    },
    {
      id: "4-research-jobs-internships-and-entry-level-health-opportunities-in-uganda",
      label: t.ugandaOpportunities,
    },
    { id: "5-africa-is-not-the-consolation-prize", label: t.africaOpportunities },
    { id: "6-do-not-let-cheap-tuition-mislead-you", label: t.costOfStudyingAbroad },
    { id: "7-build-skills-that-change-your-cv", label: t.buildYourSkills },
    { id: "8-choose-a-career-ladder", label: t.careerPaths },
    { id: "9-pick-the-roadmap-that-fits-you", label: t.yourRoadmap },
    {
      id: "10-build-toward-the-doors-that-are-not-open-yet",
      label: t.buildTowardLaterDoors,
    },
    {
      id: "11-opportunity-board-14-august-2026",
      label: t.opportunityBoard,
    },
    {
      id: "remove-these-from-your-list",
      label: t.notWorthApplying,
    },
    { id: "frequently-asked-questions", label: t.faq },
    { id: "the-vantage-position", label: t.vantagePosition },
    { id: "verification-and-corrections", label: t.verificationCorrections },
  ];

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
            locale={locale}
            items={[
              { label: c.home, href: localePath("/", locale) },
              { label: s.title, href: localePath("/stories", locale) },
              { label: story.title },
            ]}
          />
        </Container>
      </div>
      <CareerGuideHero story={story} locale={locale} />

      <div id="career-guide-content" className="py-10 md:py-14">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:gap-14">
            <GuideNavigation items={navigationItems} locale={locale} />

            <article className="min-w-0">
              <GuideQuickStart items={opening.quickStartItems} />

              <section className="py-10 md:py-14" aria-label={t.guideIntroduction}>
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
                  return <FundingSection key={section.id} section={section} locale={locale} />;
                }

                if (section.id === "9-pick-the-roadmap-that-fits-you") {
                  return <RoadmapsSection key={section.id} section={section} locale={locale} />;
                }

                if (section.id === "11-opportunity-board-14-august-2026") {
                  return <OpportunitySection key={section.id} section={section} locale={locale} />;
                }

                if (section.id === "the-vantage-position") {
                  return (
                    <div key={section.id} className="border-t border-border py-12 md:py-16">
                      <VantageView>
                        <Markdown variant="guide" locale={locale}>{section.body}</Markdown>
                      </VantageView>
                    </div>
                  );
                }

                if (section.id === "verification-and-corrections") {
                  return (
                    <div key={section.id} className="border-t border-border py-12 md:py-16">
                      <VerificationPanel>
                        <Markdown variant="guide" locale={locale}>{section.body}</Markdown>
                      </VerificationPanel>
                    </div>
                  );
                }

                return (
                  <GuideArticleSection
                    key={section.id}
                    section={section}
                    locale={locale}
                    idPrefix={
                      section.id === "frequently-asked-questions" ? "faq" : undefined
                    }
                  />
                );
              })}

              <CareerAlertsCta story={story} locale={locale} />

              <div className="mt-10">
                <ArticleCtaBar slug={story.slug} locale={locale} />
              </div>
            </article>
          </div>

          <RelatedStories stories={relatedStories} locale={locale} />
        </Container>
      </div>
    </>
  );
}
