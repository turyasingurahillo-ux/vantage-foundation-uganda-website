import Image from "next/image";
import { Partner } from "@/types";

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const logoAlt = partner.logoAlt ?? `${partner.name} logo`;

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-4 rounded-xl border border-border bg-white p-6 transition-colors hover:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={`${partner.name} — ${partner.relationshipType}`}
    >
      <div className="relative aspect-[3/2] w-full max-w-[180px]">
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={logoAlt}
            fill
            className="object-contain grayscale opacity-70 transition-all duration-200 group-hover:grayscale-0 group-hover:opacity-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center">
            <span className="text-sm font-semibold text-foreground">
              {partner.name}
            </span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{partner.name}</p>
        {partner.relationshipType && (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {partner.relationshipType}
          </p>
        )}
      </div>
    </a>
  );
}
