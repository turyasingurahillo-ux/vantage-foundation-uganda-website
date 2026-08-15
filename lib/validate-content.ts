// Build-time content validation using Zod schemas.
//
// This module validates every content/*.ts module against a schema that
// mirrors the TypeScript types in types/index.ts. It is called from a
// prebuild script (npm run validate-content) and should also be wired
// into CI before `npm run build`.
//
// The goal is to catch content errors (missing required fields, invalid
// slugs, placeholder text that slipped through, broken cross-references)
// before they reach production.
//
// Usage:
//   npx tsx lib/validate-content.ts
//   # Exit code 0 = all valid, 1 = errors found

import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  contentSocialImageCandidates,
  resolveSocialImage,
} from "./social-image";
import { site } from "../content/site";
import { projects } from "../content/projects";
import { stories } from "../content/stories";
import { areasOfWork } from "../content/areas";
import { team } from "../content/team";
import { partners } from "../content/partners";
import { impactStats } from "../content/impact";
import { reports } from "../content/reports";
import { faq } from "../content/faq";
import { mediaAssets } from "../content/media";
import { reachDistricts } from "../content/reach";

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/** A non-empty trimmed string. */
const nonEmpty = z.string().trim().min(1, "must not be empty");

/** A slug: lowercase, hyphen-separated, alphanumeric. */
const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be a lowercase slug (letters, numbers, hyphens only)"
  );

/** An ISO date string (YYYY-MM-DD), or a free-form date for legacy content. */
const dateish = z.string().min(1);

/** URL or path. */
const urlOrPath = z.string().trim().min(1);

/** A described social card. See SocialImageSource in types/index.ts. */
const socialImageSource = z.object({
  url: z
    .string()
    .startsWith("/", "must be a site-relative path, not an external URL"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().optional(),
  type: z.string().optional(),
});

const seoMeta = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    socialImage: socialImageSource.optional(),
  })
  .optional();

const consentClassification = z
  .enum(["none", "verified", "pending", "group-consent"])
  .optional();

// ---------------------------------------------------------------------------
// Schemas per content module
// ---------------------------------------------------------------------------

const navItem = z.object({
  label: nonEmpty,
  href: nonEmpty,
});

const contactInfo = z.object({
  // Optional by design: the site publishes an address only once a verified
  // domain alias is configured via NEXT_PUBLIC_CONTACT_EMAIL. When unset,
  // visitors are routed to the contact form instead. A consumer-provider
  // address here would mean the protected operational mailbox had been
  // re-published, so reject those outright.
  publicEmail: z
    .string()
    .email("must be a valid email")
    .refine(
      (value) => !/@(gmail|googlemail|yahoo|hotmail|outlook|live|aol|icloud)\./i.test(value),
      "must be a domain alias, not a personal mailbox",
    )
    .optional(),
  phone: nonEmpty,
  address: nonEmpty,
  city: nonEmpty,
  country: nonEmpty,
});

const socialLinks = z
  .object({
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
  })
  .optional();

const bankDetails = z.object({
  bankName: nonEmpty,
  accountName: nonEmpty,
  accountNumber: nonEmpty,
  swiftCode: nonEmpty,
});

const siteConfigSchema = z.object({
  name: nonEmpty,
  legalName: nonEmpty,
  tagline: nonEmpty,
  description: nonEmpty,
  mission: nonEmpty,
  vision: nonEmpty,
  values: z.array(nonEmpty).min(1),
  founded: nonEmpty,
  contact: contactInfo,
  socials: socialLinks,
  bankDetails,
  nav: z.array(navItem).min(1),
  primaryCta: navItem,
  secondaryCta: navItem,
  url: nonEmpty,
});

const projectDocument = z.object({
  title: nonEmpty,
  url: urlOrPath,
  type: z.enum(["report", "budget", "agreement", "other"]).optional(),
  date: dateish.optional(),
  description: z.string().optional(),
});

const projectSchema = z.object({
  id: nonEmpty,
  slug,
  title: nonEmpty,
  category: z.enum(["Health", "Education", "Humanitarian Aid", "Water & Sanitation", "Youth Leadership"]),
  status: z.enum(["Active", "Completed", "Planned"]),
  location: nonEmpty,
  date: dateish,
  summary: nonEmpty,
  heroImage: z.string().optional(),
  objective: z.string().optional(),
  activities: z.array(nonEmpty).optional(),
  outcomes: z.array(nonEmpty).optional(),
  beneficiaries: z.string().optional(),
  partners: z.array(nonEmpty).optional(),
  gallery: z.array(nonEmpty).optional(),
  relatedStorySlugs: z.array(slug).optional(),
  body: z.string().optional(),
  cta: z
    .object({
      label: nonEmpty,
      href: nonEmpty,
    })
    .optional(),
  // Phase 4 extensions
  reportingPeriod: z
    .object({
      start: dateish.optional(),
      end: dateish.optional(),
    })
    .optional(),
  fundingStatus: z.string().optional(),
  startDate: dateish.optional(),
  endDate: dateish.optional(),
  documents: z.array(projectDocument).optional(),
  seo: seoMeta,
  published: z.boolean().optional(),
  consentClassification,
  // Taxonomy extensions (all optional for backward compatibility)
  primaryProgramme: z.enum(["health", "education", "humanitarian", "water"]).optional(),
  secondaryProgrammes: z.array(z.enum(["health", "education", "humanitarian", "water"])).optional(),
  themes: z.array(nonEmpty).optional(),
  beneficiaryGroups: z.array(nonEmpty).optional(),
  sdgs: z.array(z.number().int().min(1).max(17)).optional(),
  flagship: z.boolean().optional(),
});

const storySchema = z.object({
  id: nonEmpty,
  slug,
  title: nonEmpty,
  excerpt: nonEmpty,
  contentType: z.enum(["Story", "Insight"]).optional(),
  author: z.string().optional(),
  authorType: z.enum(["Person", "Organization"]).optional(),
  role: z.string().optional(),
  date: dateish,
  updatedAt: dateish.optional(),
  readingTimeMinutes: z.number().int().positive().optional(),
  location: z.string().optional(),
  category: nonEmpty,
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
  heroImageCredit: z.string().optional(),
  relatedProjectSlugs: z.array(slug).optional(),
  body: nonEmpty,
  // Phase 4 extensions
  tags: z.array(nonEmpty).optional(),
  consentClassification,
  seo: seoMeta,
  faqs: z
    .array(
      z.object({
        question: nonEmpty,
        answer: nonEmpty,
      })
    )
    .optional(),
  published: z.boolean().optional(),
});

const teamMemberSchema = z.object({
  id: nonEmpty,
  slug: nonEmpty,
  fullName: nonEmpty,
  displayName: nonEmpty,
  role: nonEmpty,
  category: z.enum(["leadership", "volunteer"]),
  shortBio: nonEmpty,
  fullBio: nonEmpty,
  image: nonEmpty,
  imageAlt: nonEmpty,
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  citations: z
    .array(z.object({ label: nonEmpty, url: z.string().url() }))
    .optional(),
  displayOrder: z.number(),
  published: z.boolean(),
});

const partnerSchema = z.object({
  name: nonEmpty,
  relationshipType: nonEmpty.optional(),
  logo: z.string().optional(),
  logoAlt: z.string().optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
});

const impactStatSchema = z.object({
  value: nonEmpty,
  label: nonEmpty,
  programme: nonEmpty,
  location: nonEmpty,
  period: nonEmpty,
  methodology: nonEmpty,
  href: urlOrPath,
});

const reportSchema = z.object({
  title: nonEmpty,
  date: dateish,
  type: nonEmpty,
  url: z.string().optional(),
  description: z.string().optional(),
});

const faqItemSchema = z.object({
  question: nonEmpty,
  answer: nonEmpty,
});

const areaOfWorkSchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
  summary: nonEmpty,
  description: nonEmpty,
  items: z.array(nonEmpty).min(1),
  icon: nonEmpty,
  image: z.string().optional(),
});

const mediaAssetSchema = z.object({
  id: nonEmpty,
  src: nonEmpty,
  alt: nonEmpty,
  caption: z.string().optional(),
  credit: z.string().optional(),
  date: dateish.optional(),
  location: z.string().optional(),
  programme: z.string().optional(),
  projectSlug: slug.optional(),
  consent: z.enum(["none", "verified", "pending", "group-consent"]),
  consentNotes: z.string().optional(),
  published: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Cross-reference validation
// ---------------------------------------------------------------------------

interface ValidationError {
  file: string;
  path: string;
  message: string;
}

/**
 * Every published story and project must advertise a social card that exists.
 *
 * The card a page advertises is whatever `contentSocialImageCandidates` picks,
 * so this resolves the real chain rather than guessing. A story added without
 * running `npm run generate:social` fails here — at prebuild, before the
 * deploy — instead of shipping an og:image that 404s and previews as the grey
 * placeholder card.
 */
function checkSocialCards(errors: ValidationError[]) {
  const items: Array<{ file: string; item: (typeof stories)[number] | (typeof projects)[number] }> = [
    ...stories.map((item) => ({ file: "content/stories.ts", item })),
    ...projects.map((item) => ({ file: "content/projects.ts", item })),
  ];

  for (const { file, item } of items) {
    if (item.published === false) continue;

    const resolved = resolveSocialImage(
      contentSocialImageCandidates(item),
      item.title
    );
    const cardPath = new URL(resolved.url).pathname;
    const onDisk = join(process.cwd(), "public", cardPath);

    if (!existsSync(onDisk)) {
      errors.push({
        file,
        path: `${item.slug}.seo.socialImage`,
        message: `social card "${cardPath}" does not exist — run \`npm run generate:social\``,
      });
    }
  }
}

function checkCrossReferences(errors: ValidationError[]) {
  const projectSlugs = new Set(projects.map((p) => p.slug));
  const storySlugs = new Set(stories.map((s) => s.slug));

  // Projects: relatedStorySlugs must reference existing stories.
  for (const project of projects) {
    if (project.relatedStorySlugs) {
      for (const storySlug of project.relatedStorySlugs) {
        if (!storySlugs.has(storySlug)) {
          errors.push({
            file: "content/projects.ts",
            path: `${project.slug}.relatedStorySlugs`,
            message: `references unknown story slug "${storySlug}"`,
          });
        }
      }
    }
  }

  // Stories: relatedProjectSlugs must reference existing projects.
  for (const story of stories) {
    if (story.relatedProjectSlugs) {
      for (const projectSlug of story.relatedProjectSlugs) {
        if (!projectSlugs.has(projectSlug)) {
          errors.push({
            file: "content/stories.ts",
            path: `${story.slug}.relatedProjectSlugs`,
            message: `references unknown project slug "${projectSlug}"`,
          });
        }
      }
    }
  }

  // Reach districts: projectSlugs must reference existing projects.
  for (const district of reachDistricts) {
    if (district.projectSlugs) {
      for (const projectSlug of district.projectSlugs) {
        if (!projectSlugs.has(projectSlug)) {
          errors.push({
            file: "content/reach.ts",
            path: `${district.name}.projectSlugs`,
            message: `references unknown project slug "${projectSlug}"`,
          });
        }
      }
    }
  }

  // No duplicate slugs.
  const allProjectSlugs = projects.map((p) => p.slug);
  const dupes = allProjectSlugs.filter(
    (s, i) => allProjectSlugs.indexOf(s) !== i
  );
  for (const d of [...new Set(dupes)]) {
    errors.push({
      file: "content/projects.ts",
      path: "slug",
      message: `duplicate project slug "${d}"`,
    });
  }

  const allStorySlugs = stories.map((s) => s.slug);
  const dupStories = allStorySlugs.filter(
    (s, i) => allStorySlugs.indexOf(s) !== i
  );
  for (const d of [...new Set(dupStories)]) {
    errors.push({
      file: "content/stories.ts",
      path: "slug",
      message: `duplicate story slug "${d}"`,
    });
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function validateModule(
  file: string,
  data: unknown,
  schema: z.ZodType
): ValidationError[] {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    file,
    path: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}

export function validateAllContent(): ValidationError[] {
  const errors: ValidationError[] = [];

  errors.push(...validateModule("content/site.ts", site, siteConfigSchema));
  errors.push(
    ...validateModule("content/projects.ts", projects, z.array(projectSchema))
  );
  errors.push(
    ...validateModule("content/stories.ts", stories, z.array(storySchema))
  );
  errors.push(
    ...validateModule(
      "content/areas.ts",
      areasOfWork,
      z.array(areaOfWorkSchema)
    )
  );
  errors.push(...validateModule("content/team.ts", team, z.array(teamMemberSchema)));
  errors.push(
    ...validateModule("content/partners.ts", partners, z.array(partnerSchema))
  );
  errors.push(
    ...validateModule(
      "content/impact.ts",
      impactStats,
      z.array(impactStatSchema)
    )
  );
  errors.push(
    ...validateModule("content/reports.ts", reports, z.array(reportSchema))
  );
  errors.push(...validateModule("content/faq.ts", faq, z.array(faqItemSchema)));
  errors.push(
    ...validateModule(
      "content/reach.ts",
      reachDistricts,
      z.array(
        z.object({
          name: nonEmpty,
          district: nonEmpty,
          latitude: z.number().min(-2).max(5),
          longitude: z.number().min(29).max(36),
          description: z.string().optional(),
          projectSlugs: z.array(slug).optional(),
        })
      )
    )
  );
  errors.push(
    ...validateModule(
      "content/media.ts",
      mediaAssets,
      z.array(mediaAssetSchema)
    )
  );

  checkCrossReferences(errors);
  checkSocialCards(errors);

  return errors;
}

// Run when invoked directly (npx tsx lib/validate-content.ts).
const isMainModule =
  typeof require !== "undefined" && require.main === module;

if (isMainModule) {
  const errors = validateAllContent();
  if (errors.length === 0) {
    console.log("✓ All content modules valid.");
    process.exit(0);
  }
  console.error(`✗ ${errors.length} content validation error(s):\n`);
  for (const e of errors) {
    console.error(`  ${e.file} [${e.path}]: ${e.message}`);
  }
  process.exit(1);
}
