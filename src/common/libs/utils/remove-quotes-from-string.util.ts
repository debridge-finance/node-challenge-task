export function removeAllQuotes(str: string) {
  return str.replace(/['"]/g, "").trim();
}
