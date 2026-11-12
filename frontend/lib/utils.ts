export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function cleanPlaceholder(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/\[Placeholder.*?\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/,\s*$/, '');
}
