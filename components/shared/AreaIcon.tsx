import { HeartPulse, GraduationCap, HandHeart, Droplets, Lightbulb, Users } from "lucide-react";

interface AreaIconProps {
  /** The `icon` field on a Programme (a lucide icon name). */
  id: string;
  className?: string;
}

/**
 * Small accent icon for programme/portfolio cards. Icons are named in
 * content/programmes.ts — legacy area ids map to the same icons.
 */
export function AreaIcon({ id, className }: AreaIconProps) {
  switch (id) {
    case "heart-pulse":
    case "health":
      return <HeartPulse className={className} aria-hidden="true" />;
    case "graduation-cap":
    case "education":
      return <GraduationCap className={className} aria-hidden="true" />;
    case "hand-heart":
    case "humanitarian":
      return <HandHeart className={className} aria-hidden="true" />;
    case "droplets":
    case "water":
      return <Droplets className={className} aria-hidden="true" />;
    case "users":
      return <Users className={className} aria-hidden="true" />;
    case "lightbulb":
    case "youth-leadership":
      return <Lightbulb className={className} aria-hidden="true" />;
    default:
      return null;
  }
}
