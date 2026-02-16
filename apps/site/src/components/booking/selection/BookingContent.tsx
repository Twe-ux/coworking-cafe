/**
 * BookingContent - Client Component for interactive booking page
 * Handles TTC/HT toggle and price conversion
 * Receives SSR data from parent Server Component
 */

"use client";

import { useState } from "react";
import SelectionHeader from "./SelectionHeader";
import SpaceGrid from "./SpaceGrid";
import type { DisplaySpace } from "./types";

interface BookingContentProps {
  initialSpaces: DisplaySpace[];
}

export default function BookingContent({ initialSpaces }: BookingContentProps) {
  const [showTTC, setShowTTC] = useState(true);

  // Function to convert price string from TTC to HT or vice versa
  // Hourly = 10% VAT, Daily = 20% VAT
  const convertPrice = (priceString: string, toTTC: boolean): string => {
    if (priceString === "Sur devis") return priceString;

    // Extract the numeric price
    const match = priceString.match(/(\d+(?:\.\d+)?)€/);
    if (!match) return priceString;

    const price = parseFloat(match[1]);

    // Determine VAT rate based on whether it's hourly or daily
    const isHourly = priceString.includes("/h");
    const vatRate = isHourly ? 1.1 : 1.2; // 10% for hourly, 20% for daily

    const convertedPrice = toTTC ? price : (price / vatRate).toFixed(2);

    // Replace the price in the original string
    return priceString.replace(/\d+(?:\.\d+)?€/, `${convertedPrice}€`);
  };

  return (
    <>
      <SelectionHeader showTTC={showTTC} onToggleTTC={setShowTTC} />
      <SpaceGrid
        spaces={initialSpaces}
        showTTC={showTTC}
        onConvertPrice={convertPrice}
      />
    </>
  );
}
