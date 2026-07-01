import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Compose Tailwind classes with conflict resolution. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
