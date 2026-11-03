/** URL of a file in /public, prefixed with the deploy base path (GitHub Pages serves under /first-repo/oceanslines). */
export const asset = (path: `/${string}`): string => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
