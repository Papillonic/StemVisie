// src/theme/tokens.ts
export const tokens = {
  // Colors
  colors: {
    glassBg: "rgba(255, 255, 255, 0.1)",
    glassBorder: "rgba(255, 255, 255, 0.2)",
    textPrimary: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    textMuted: "rgba(255, 255, 255, 0.6)",
    bgSticky: "rgba(0, 0, 0, 0.3)",
  },

  // Shadows
  shadows: {
    card: "0 8px 24px rgba(0, 0, 0, 0.3)",
  },

  // Blur
  blur: {
    card: "blur(20px)",
    sticky: "blur(10px)",
  },

  // Radius
  radius: {
    card: "1rem", // 16px
    rounded: "0.75rem", // 12px, voor kleine cards
  },

  // Spacing
  spacing: {
    cardPadding: "1.5rem", // 24px
    stickyPadding: "1rem", // 16px
  },
};
