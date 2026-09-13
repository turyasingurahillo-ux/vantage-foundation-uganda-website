export const DONATION_TRANSFER_METHODS = [
  "bank",
  "remitly",
  "worldremit",
] as const;

export type DonationTransferMethod =
  (typeof DONATION_TRANSFER_METHODS)[number];

export const OFFICIAL_TRANSFER_URLS: Record<
  Exclude<DonationTransferMethod, "bank">,
  string
> = {
  remitly: "https://www.remitly.com/",
  worldremit: "https://www.worldremit.com/",
};

const REFERENCE_TOKEN_LENGTH = 10;

/**
 * Creates a short, non-secret reference a donor can keep while the transfer is
 * waiting for verification. The reference is a matching aid only; it never
 * proves that funds were received.
 */
export function createDonationReference(now: Date = new Date()): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replaceAll("-", "")
      : `${Math.random().toString(36).slice(2)}${Math.random()
          .toString(36)
          .slice(2)}`;

  const token = random
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, REFERENCE_TOKEN_LENGTH)
    .toUpperCase()
    .padEnd(REFERENCE_TOKEN_LENGTH, "0");

  return `VFU-${now.getUTCFullYear()}-${token}`;
}

export function transferMethodLabel(method: DonationTransferMethod): string {
  switch (method) {
    case "remitly":
      return "Remitly";
    case "worldremit":
      return "WorldRemit";
    default:
      return "Direct bank transfer";
  }
}
