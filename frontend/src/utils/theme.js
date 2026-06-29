export const STORAGE_THEME = "agile_insurance_theme_v1";

export const getStoredTheme = () => localStorage.getItem(STORAGE_THEME) || "light";

export const setHtmlTheme = (mode) => {
  const html = document.documentElement;
  html.dataset.theme = mode;
  if (mode === "dark") html.classList.add("dark");
  else html.classList.remove("dark");
};
