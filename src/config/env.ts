// Single source of truth for environment-based URLs.
// Change the values in .env — no URLs should be hardcoded elsewhere.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;
export const IMAGE_BASE_URL: string = import.meta.env.VITE_IMAGE_BASE_URL;
