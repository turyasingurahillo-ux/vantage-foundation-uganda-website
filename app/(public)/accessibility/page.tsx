import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ContactChannelListItem } from "@/components/shared/ContactChannel";
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Accessibility Statement",
  description:
    "Vantage Foundation Uganda's commitment to making our website accessible to everyone, including people with disabilities.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Accessibility Statement"
            description="Our commitment to digital accessibility."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-8 leading-relaxed text-muted-foreground">
            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Our commitment
              </h2>
              <p>
                {site.legalName} is committed to making our website accessible
                to everyone, including people with disabilities. We believe
                that access to information about our programmes and services
                is a right, not a privilege.
              </p>
              <p className="mt-3">
                We aim to conform to the{" "}
                <strong className="text-foreground">
                  Web Content Accessibility Guidelines (WCAG) 2.2 Level AA
                </strong>{" "}
                standard. These guidelines explain how to make web content
                more accessible to people with a wide range of disabilities,
                including visual, auditory, physical, speech, cognitive,
                language, learning, and neurological disabilities.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                What we have done
              </h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-foreground">
                    Heading structure:
                  </strong>{" "}
                  every page uses a logical heading order (one h1, followed by
                  h2 and h3) so screen reader users can navigate by heading.
                </li>
                <li>
                  <strong className="text-foreground">
                    Keyboard navigation:
                  </strong>{" "}
                  all interactive elements (links, buttons, forms) can be
                  used with the keyboard alone (Tab, Shift+Tab, Enter,
                  Escape).
                </li>
                <li>
                  <strong className="text-foreground">
                    Focus indicators:
                  </strong>{" "}
                  all interactive elements show a visible focus outline when
                  navigated by keyboard.
                </li>
                <li>
                  <strong className="text-foreground">
                    Mobile menu:
                  </strong>{" "}
                  the mobile navigation menu traps focus while open, restores
                  focus when closed, and can be dismissed with the Escape
                  key.
                </li>
                <li>
                  <strong className="text-foreground">
                    Skip link:
                  </strong>{" "}
                  a &ldquo;Skip to content&rdquo; link is available at the top
                  of every page for keyboard users to bypass navigation.
                </li>
                <li>
                  <strong className="text-foreground">
                    Form labels:
                  </strong>{" "}
                  all form fields have associated labels, and error messages
                  are announced to screen readers.
                </li>
                <li>
                  <strong className="text-foreground">
                    Colour contrast:
                  </strong>{" "}
                  all text and background colour combinations meet WCAG AA
                  contrast requirements (at least 4.5:1 for normal text).
                </li>
                <li>
                  <strong className="text-foreground">
                    ARIA attributes:
                  </strong>{" "}
                  icon-only buttons have aria-labels, toggle buttons indicate
                  their state with aria-pressed, and dialog regions use
                  role=&ldquo;dialog&rdquo; and aria-modal.
                </li>
                <li>
                  <strong className="text-foreground">
                    Responsive design:
                  </strong>{" "}
                  the site works at 320px width and at 200% zoom without
                  horizontal scrolling.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Known limitations
              </h2>
              <p>
                We are aware of the following areas that may still present
                accessibility challenges:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-foreground">
                    Automated and manual testing:
                  </strong>{" "}
                  automated axe-core checks cover the public routes in our
                  release suite. Manual keyboard, zoom and responsive checks
                  complement those scans.
                </li>
                <li>
                  <strong className="text-foreground">
                    Screen reader testing:
                  </strong>{" "}
                  manual testing with NVDA and VoiceOver is documented in our
                  testing checklist but has not been fully completed.
                </li>
                <li>
                  <strong className="text-foreground">
                    Image descriptions:
                  </strong>{" "}
                  published photographs use descriptions based on their
                  available media records. We continue to review descriptions
                  with programme teams as more context becomes available.
                </li>
                <li>
                  <strong className="text-foreground">
                    Video content:
                  </strong>{" "}
                  we do not currently host video content. When we do, we will
                  provide captions and audio descriptions.
                </li>
              </ul>
              <p className="mt-3">
                If you encounter an accessibility barrier not listed here,
                please let us know so we can address it.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                How to report an accessibility issue
              </h2>
              <p>
                If you have difficulty accessing any part of our website or
                have a suggestion for improvement, please contact us:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-1">
                <ContactChannelListItem />
                <li>
                  Phone/WhatsApp:{" "}
                  <a
                    href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                    className="text-primary underline"
                  >
                    {site.contact.phone}
                  </a>
                </li>
              </ul>
              <p className="mt-3">
                We aim to respond to accessibility reports within 5 working
                days and to fix confirmed issues in the next website update.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Technical information
              </h2>
              <p>
                This website is built with Next.js 16 and React 19, using
                semantic HTML, ARIA where appropriate, and Tailwind CSS for
                styling. We test against the latest versions of Chrome,
                Firefox, and Safari.
              </p>
              <p className="mt-3">
                For the full technical documentation of our accessibility
                implementation, see our{" "}
                <a
                  href="/reports-and-accountability"
                  className="text-primary underline"
                >
                  Reports &amp; Accountability
                </a>{" "}
                page.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Compatibility
              </h2>
              <p>
                The website is designed to be compatible with:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-2">
                <li>Screen readers: NVDA, VoiceOver, TalkBack</li>
                <li>Browser zoom up to 200%</li>
                <li>Keyboard-only navigation</li>
                <li>Mobile devices (iOS and Android)</li>
                <li>Modern browsers (Chrome, Firefox, Safari, Edge)</li>
              </ul>
            </div>

            <p className="border-t border-border pt-6 text-sm text-muted-foreground">
              Last updated: July 2026. This statement is reviewed annually or
              after significant website changes.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
