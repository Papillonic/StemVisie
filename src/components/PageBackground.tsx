// src/components/PageBackground.tsx
type Props = { children: React.ReactNode };

export default function PageBackground({ children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Achtergrond image — fixed, scrollt niet mee */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/bg.png')" }}
      />

      {/* Blur overlay (optioneel zwart tintje voor contrast) */}
      <div className="fixed inset-0 backdrop-blur-lg bg-black/20 -z-10" />

      {/* Scrollbare content */}
      <div className="relative z-10 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
