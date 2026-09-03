import { Container } from "@/components/shared/Container";
import { Sparkles, MapPin, Heart, Users } from "lucide-react";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

export function TrustStrip({ copy }: { copy: HomepageSectionContent["trust"] }) {
  const trustItems = [
    { icon: Sparkles, text: copy[0] }, { icon: MapPin, text: copy[1] },
    { icon: Heart, text: copy[2] }, { icon: Users, text: copy[3] },
  ];

  return (
    <section className="border-y border-border bg-surface py-10">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground">
          {trustItems.map((item) => (
            <span key={item.text} className="inline-flex items-center gap-2">
              <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              {item.text}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
