import { z } from "zod";
import { CONTACT_CATEGORY_VALUES } from "@/lib/contact-categories";

// Field limits. These are generous enough for a detailed grant or partnership
// inquiry but bounded so a bot cannot post megabytes through the endpoint.
export const MAX_NAME = 100;
export const MAX_ORGANISATION = 150;
export const MAX_PHONE = 40;
export const MAX_EMAIL = 254;
export const MAX_MESSAGE = 5000;
export const MAX_CAMPAIGN = 200;
export const MAX_TRANSACTION_REF = 200;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(MAX_NAME, `Name must be ${MAX_NAME} characters or fewer`),
  email: z
    .string()
    .trim()
    .max(MAX_EMAIL, "Email address is too long")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(MAX_PHONE, "Phone number is too long")
    .optional(),
  organisation: z
    .string()
    .trim()
    .max(MAX_ORGANISATION, `Organisation must be ${MAX_ORGANISATION} characters or fewer`)
    .optional(),
  // Fixed enum: the category selects the destination mailbox server-side, so
  // it must never be free text from the request.
  subject: z.enum(CONTACT_CATEGORY_VALUES, {
    message: "Please choose what your message is about",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please give us at least a sentence so we can help")
    .max(MAX_MESSAGE, `Message must be ${MAX_MESSAGE} characters or fewer`),
  website: z.string().optional(), // honeypot 1
  company_url: z.string().optional(), // honeypot 2 (realistic name)
  form_loaded_at: z.string().optional(), // time-trap
  "cf-turnstile-response": z.string().optional(), // bot challenge token
  // Page-of-origin: set by a hidden field in ContactForm via usePathname().
  // Validated and max-length-checked to prevent abuse; nullable for manual intake.
  origin_page: z
    .string()
    .trim()
    .max(200, "Origin page value is too long")
    .optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email").max(MAX_EMAIL, "Email is too long"),
  consent: z.enum(["on"], { message: "Please consent to receive updates" }),
  website: z.string().optional(), // honeypot 1
  company_url: z.string().optional(), // honeypot 2
  form_loaded_at: z.string().optional(), // time-trap
});

export const donorSchema = z.object({
  name: z.string().min(2, "Name is required").max(MAX_NAME, "Name is too long"),
  email: z.string().email("Please enter a valid email").max(MAX_EMAIL, "Email is too long"),
  phone: z.string().max(MAX_PHONE, "Phone number is too long").optional(),
  amount: z.coerce
    .number()
    .positive("Please select or enter a valid amount")
    .max(1_000_000_000, "Amount is too large"),
  frequency: z.enum(["one-time", "monthly"]),
  campaign: z.string().min(1, "Please select a campaign").max(MAX_CAMPAIGN, "Campaign is too long"),
  transactionReference: z.string().max(MAX_TRANSACTION_REF, "Transaction reference is too long").optional(),
  message: z.string().max(MAX_MESSAGE, "Message is too long").optional(),
  website: z.string().optional(), // honeypot 1
  company_url: z.string().optional(), // honeypot 2
  form_loaded_at: z.string().optional(), // time-trap
  submissionId: z.string().optional(), // idempotency token
});
