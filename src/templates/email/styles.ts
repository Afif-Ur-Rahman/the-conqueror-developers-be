export const BASE_STYLES = {
  background: "#f5f5f7",
  cardBackground: "#ffffff",
  accent: "#5035ff",
  accentDark: "#3c2acc",
  textPrimary: "#1f1f24",
  textSecondary: "#555770",
  divider: "#e0e2ec",
  success: "#19c37d",
};

export const sanitize = (value?: string) => value?.replace(/[<>]/g, "") ?? "";
