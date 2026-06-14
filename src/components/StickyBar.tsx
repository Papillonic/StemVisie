import { tokens } from "../theme/tokens";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function StickyBar({ children }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 flex justify-center"
      style={{
        background: tokens.colors.bgSticky,
        backdropFilter: tokens.blur.sticky,
        WebkitBackdropFilter: tokens.blur.sticky,
        borderTop: `1px solid ${tokens.colors.glassBorder}`,
        padding: tokens.spacing.stickyPadding,
      }}
    >
      <div className="w-full max-w-2xl flex justify-center gap-3 flex-wrap">
        {children}
      </div>
    </div>
  );
}
