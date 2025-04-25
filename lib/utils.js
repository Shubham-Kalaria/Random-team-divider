import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getCategoryIcon(category) {
  switch (category) {
    case "batsman":
      return "🏏"; // Cricket bat icon
    case "bowler":
      return "🥎"; // Cricket ball icon
    case "all-rounder":
      return "⭐"; // all rounder icon
    default:
      return "🏏";
  }
}
