import { getFlagshipProject } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { programmeTokenForCategory } from "@/lib/design-tokens";
import { MapPin, Calendar, Users } from "lucide-react";

/**
 * Editorial, magazine-style homepage section for the flagship project.
 * Gives the project prominent treatment with a large image, story-driven
 * copy, and key facts (location, status, beneficiaries, funding).
 *
 * Renders nothing if there is no flagship project (graceful no-op).
 */
export function FlagshipProjectSection() {
  const project = getFlagshipProject();
  if (!project || !project.flagship) return null;

  const prog = programmeTokenForCategory(project.category);

  return (
    <section className="bg-surface py-16 md:py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image column */}
          <div className="order-1 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              <ImageOrPlaceholder
                src={project.heroImage}
                alt={project.title}
                fill
                preset="half"
                priority
                containerClassName="h-full w-full"
              />
              <span
                className="absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: prog.safeHex }}
              >
                {project.category}
              </span>
            </div>
          </div>

          {/* Content column */}
          <div className="order-2 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Flagship project
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {project.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {project.summary}
            </p>

            {/* Key facts */}
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  Location
                </dt>
                <dd className="text-sm text-foreground">
                  {project.location}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  Timeline
                </dt>
                <dd className="text-sm text-foreground">{project.date}</dd>
              </div>
              {project.beneficiaries && (
                <div className="flex flex-col gap-1">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Users className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    Beneficiaries
                  </dt>
                  <dd className="text-sm text-foreground">
                    {project.beneficiaries}
                  </dd>
                </div>
              )}
              {project.fundingStatus && (
                <div className="flex flex-col gap-1">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center text-primary"
                      aria-hidden="true"
                    >
                      <span className="block h-2 w-2 rounded-full bg-primary" />
                    </span>
                    Funding
                  </dt>
                  <dd className="text-sm text-foreground">
                    {project.fundingStatus}
                  </dd>
                </div>
              )}
            </dl>

            {/* Themes */}
            {project.themes && project.themes.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {project.themes.map((theme) => (
                  <Badge key={theme} variant="outline">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`/projects/${project.slug}`}>
                Read the full story
              </Button>
              {project.fundingStatus && (
                <Button href="/donate" variant="outline">
                  Support this project
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
