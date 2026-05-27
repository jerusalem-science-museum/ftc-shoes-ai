export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";

export async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
