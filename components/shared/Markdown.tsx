import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  ActionStatusBadge,
  EvidenceBadge,
  type ActionStatus,
  type EvidenceStatus,
} from "@/components/guides/GuideBadges";
import { headingId as slugifyHeading } from "@/lib/heading-id";

interface MarkdownProps {
  children: string;
  className?: string;
  variant?: "default" | "article" | "guide" | "compact";
  pullQuoteAttribution?: string;
  /**
   * Render VERIFIED / ACT NOW style markers as badges. Defaults to on for the
   * guide variant; opt in elsewhere (opportunity cards) without inheriting
   * article-scale typography.
   */
  statusBadges?: boolean;
  /**
   * Namespace generated sub-heading (h3/h4) ids so questions that appear both
   * inline and in the FAQ do not emit duplicate ids. Section-level h2 anchors
   * are left untouched because the guide navigation targets them.
   */
  idPrefix?: string;
}

function headingText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return headingText(node.props.children);
  }
  return Children.toArray(node).map(headingText).join("");
}

export function headingId(children: ReactNode): string {
  return slugifyHeading(headingText(children));
}

function guideStatusBadge(children: ReactNode) {
  const value = headingText(children).trim().replace(/[.:]$/, "").toUpperCase();
  const evidence: Partial<Record<string, EvidenceStatus>> = {
    VERIFIED: "verified",
    CORROBORATED: "corroborated",
    UNCONFIRMED: "unconfirmed",
  };
  const action: Partial<Record<string, ActionStatus>> = {
    "ACT NOW": "act",
    "BUILD TOWARD IT": "build",
    WATCH: "watch",
    "NOT FOR NOW": "not-now",
    "FUNDING TRAP": "funding-trap",
  };

  if (evidence[value]) return <EvidenceBadge status={evidence[value]} />;
  if (action[value]) return <ActionStatusBadge status={action[value]} />;
  return null;
}

export function Markdown({
  children,
  className,
  variant = "default",
  pullQuoteAttribution,
  statusBadges,
  idPrefix,
}: MarkdownProps) {
  const isArticle = variant === "article" || variant === "guide";
  const isGuide = variant === "guide";
  const isCompact = variant === "compact";
  const showStatusBadges = statusBadges ?? isGuide;
  const anchorId = (children: ReactNode) => {
    const id = headingId(children);
    return idPrefix ? `${idPrefix}-${id}` : id;
  };

  return (
    <div
      className={[
        isArticle
          ? "article-prose text-[1.0625rem] leading-[1.75] text-slate-700 sm:text-lg md:text-[1.1875rem]"
          : isCompact
            ? "text-[0.975rem] leading-relaxed text-slate-700"
            : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          p({ children }) {
            return (
              <p
                className={
                  isArticle
                    ? "mb-[1.25em] last:mb-0"
                    : isCompact
                      ? "leading-relaxed text-slate-700"
                    : "leading-relaxed text-muted-foreground"
                }
              >
                {children}
              </p>
            );
          },
          h2({ children }) {
            return (
              <h2
                id={headingId(children)}
                className={
                  isArticle
                    ? "mb-5 mt-12 scroll-mt-40 text-[1.625rem] font-bold leading-[1.2] tracking-[-0.015em] text-foreground first:mt-0 sm:text-[1.75rem] md:mt-16 lg:scroll-mt-28 md:text-[2rem]"
                    : "mt-8 text-2xl font-bold text-foreground first:mt-0"
                }
              >
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3
                id={anchorId(children)}
                className={
                  isArticle
                    ? "mb-4 mt-10 scroll-mt-40 text-[1.375rem] font-semibold leading-[1.3] text-foreground lg:scroll-mt-28 md:text-2xl"
                    : "mt-6 text-xl font-semibold text-foreground"
                }
              >
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4
                id={anchorId(children)}
                className={
                  isArticle
                    ? "mb-3 mt-8 scroll-mt-40 text-xl font-semibold leading-snug text-foreground lg:scroll-mt-28"
                    : "mt-5 text-lg font-semibold text-foreground"
                }
              >
                {children}
              </h4>
            );
          },
          ul({ children }) {
            return (
              <ul
                className={
                  isArticle
                    ? "mb-[1.25em] list-disc space-y-2 pl-6"
                    : isCompact
                      ? "grid gap-3 md:grid-cols-2"
                    : "mt-4 list-disc space-y-2 pl-5"
                }
              >
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol
                className={
                  isArticle
                    ? "mb-[1.25em] list-decimal space-y-2 pl-6"
                    : isCompact
                      ? "grid gap-3 md:grid-cols-2"
                    : "mt-4 list-decimal space-y-2 pl-5"
                }
              >
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li
                className={
                  isArticle
                    ? ""
                    : isCompact
                      ? "border-l-2 border-primary/40 bg-white/70 px-4 py-3"
                      : "text-muted-foreground"
                }
              >
                {children}
              </li>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote
                className={
                  isArticle
                    ? "my-10 rounded-2xl border-l-4 border-primary bg-primary-light/70 px-6 py-7 text-[1.25rem] font-medium leading-[1.55] text-foreground [&_p]:mb-0 sm:my-12 sm:px-8 sm:py-8 sm:text-[1.5rem] md:text-[1.625rem]"
                    : "my-6 border-l-4 border-primary pl-5 italic text-muted-foreground"
                }
              >
                {children}
                {isArticle && pullQuoteAttribution && (
                  <cite className="mt-5 block text-sm font-semibold not-italic tracking-normal text-primary sm:text-base">
                    {pullQuoteAttribution}
                  </cite>
                )}
              </blockquote>
            );
          },
          a({ href, children }) {
            const isExternal = /^https?:\/\//.test(href || "");
            return (
              <a
                href={href}
                className="rounded-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
          strong({ children }) {
            const badge = showStatusBadges ? guideStatusBadge(children) : null;
            return badge ?? <strong className="font-bold text-foreground">{children}</strong>;
          },
          table({ children }) {
            return (
              <div className="my-8">
                <p className="mb-2 flex items-center justify-end text-xs font-semibold text-muted-foreground md:hidden">
                  Swipe to compare <span aria-hidden="true">→</span>
                </p>
                <div
                  className="relative overflow-x-auto rounded-xl border border-border bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
                  tabIndex={0}
                  role="region"
                  aria-label="Scrollable comparison table"
                >
                  <table className="w-full min-w-[42rem] border-collapse text-left text-[0.9375rem] leading-relaxed">
                    {children}
                  </table>
                </div>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-primary-light text-foreground">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="border-b border-border px-4 py-3 font-semibold">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border-b border-border px-4 py-3 align-top">
                {children}
              </td>
            );
          },
          hr() {
            return <hr className="my-12 border-border" />;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
