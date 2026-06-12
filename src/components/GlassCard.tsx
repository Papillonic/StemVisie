// src/components/GlassCard.tsx
import { tokens } from "../theme/tokens";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: tokens.colors.glassBg,
        border: `1px solid ${tokens.colors.glassBorder}`,
        backdropFilter: tokens.blur.card,
        WebkitBackdropFilter: tokens.blur.card,
        boxShadow: tokens.shadows.card,
        color: tokens.colors.textPrimary,
      }}
    >
      {children}
    </div>
  );
}
