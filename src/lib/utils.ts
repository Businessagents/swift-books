// Utility function for combining class names
// Since we're using Chakra UI instead of Tailwind, this is simplified
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
