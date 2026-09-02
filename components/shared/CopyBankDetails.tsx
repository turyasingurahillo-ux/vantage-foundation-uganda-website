"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";
import type { BankDetailsCopy } from "@/lib/i18n/content/engagement";

export function CopyBankDetails({ copy }: { copy: BankDetailsCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const { bankDetails } = site;
    const text = `${copy.bank}: ${bankDetails.bankName}\n${copy.accountName}: ${bankDetails.accountName}\n${copy.accountNumber}: ${bankDetails.accountNumber}\n${copy.swift}: ${bankDetails.swiftCode}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? copy.copied : copy.copy}
    </Button>
  );
}
