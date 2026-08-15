import Link from "next/link";
import { areasOfWork } from "@/content/areas";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { ArrowRight } from "lucide-react";

export function AreasOfWork() {
  return (
    <section className="bg-surface py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow="Our Work"
          title="Four connected programmes, one community-centred mission."
          description="Health, education, humanitarian relief and clean water reinforce one another — and youth leadership runs through them all."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {areasOfWork.map((area) => (
            <Link
              key={area.id}
              href={`/programmes/${area.id}`}
              className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ImageOrPlaceholder
                  src={area.image}
                  alt={area.imageAlt || area.title}
                  fill
                  sizes="(max-width: 639px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {area.title} Programme
                </p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                  {area.programmeName ?? area.title}
                </h3>
                <p className="mt-3 text-muted-foreground">{area.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore {area.programmeName ?? area.title}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
