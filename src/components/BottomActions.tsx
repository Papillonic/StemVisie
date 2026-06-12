// src/components/BottomActions.tsx
import React from "react";
import { Button } from "./ui/button";

interface BottomActionsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
  disableSubmit?: boolean;
}

/**
 * Sticky action bar onderaan scherm
 */
export default function BottomActions({
  onPrevious,
  onNext,
  onSubmit,
  disablePrevious,
  disableNext,
  disableSubmit,
}: BottomActionsProps) {
  return (
    <div
      className="
        fixed bottom-0 left-0 w-full z-20
        bg-black/50 backdrop-blur-md
        border-t border-white/20
        p-4 flex justify-between gap-2
      "
    >
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={disablePrevious}
      >
        Vorige
      </Button>

      {onNext && (
        <Button
          variant="default"
          onClick={onNext}
          disabled={disableNext}
        >
          Volgende
        </Button>
      )}

      {onSubmit && (
        <Button
          variant="destructive"
          onClick={onSubmit}
          disabled={disableSubmit}
        >
          Afronden
        </Button>
      )}
    </div>
  );
}
