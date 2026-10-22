/** Cuts text to fit a small space, ending on an ellipsis rather than mid-word whitespace. */
export const shorten = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
