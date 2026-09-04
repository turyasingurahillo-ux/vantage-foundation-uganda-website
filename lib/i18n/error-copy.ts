import type { Locale } from "./config";

/**
 * `app/[locale]/error.tsx` is a Client Component, so it cannot import
 * `lib/i18n/dictionaries.ts` — that module is marked `server-only` to keep
 * the full dictionary out of the browser bundle. This is the small subset the
 * error boundary needs, duplicated deliberately and kept in sync by
 * `tests/unit/i18n.test.ts`.
 */
export type ErrorCopy = {
  eyebrow: string;
  title: string;
  description: string;
  tryAgain: string;
  returnHome: string;
  errorId: string;
};

export const errorCopy: Record<Locale, ErrorCopy> = {
  en: {
    eyebrow: "Something went wrong",
    title: "An error occurred",
    description:
      "We are sorry — something went wrong while loading this page. Please try again, or contact us if the problem persists.",
    tryAgain: "Try again",
    returnHome: "Return Home",
    errorId: "Error ID",
  },
  de: {
    eyebrow: "Es ist ein Problem aufgetreten",
    title: "Ein Fehler ist aufgetreten",
    description:
      "Beim Laden dieser Seite ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns, falls das Problem weiterhin besteht.",
    tryAgain: "Erneut versuchen",
    returnHome: "Zur Startseite",
    errorId: "Fehler-ID",
  },
  fr: {
    eyebrow: "Un problème est survenu",
    title: "Une erreur s’est produite",
    description:
      "Une erreur s’est produite lors du chargement de cette page. Veuillez réessayer ou nous contacter si le problème persiste.",
    tryAgain: "Réessayer",
    returnHome: "Retour à l’accueil",
    errorId: "Identifiant de l’erreur",
  },
  es: {
    eyebrow: "Algo salió mal",
    title: "Se produjo un error",
    description:
      "Lo sentimos: ocurrió un error al cargar esta página. Inténtalo de nuevo o contáctanos si el problema persiste.",
    tryAgain: "Intentar de nuevo",
    returnHome: "Volver al inicio",
    errorId: "ID del error",
  },
  ar: {
    eyebrow: "حدث خطأ ما",
    title: "حدث خطأ",
    description:
      "نعتذر — حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى أو التواصل معنا إذا استمرت المشكلة.",
    tryAgain: "حاول مرة أخرى",
    returnHome: "العودة إلى الرئيسية",
    errorId: "معرّف الخطأ",
  },
};
