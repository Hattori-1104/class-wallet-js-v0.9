import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatMoney = (money: number) => new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(money)
