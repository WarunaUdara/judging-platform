"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type ReactNode,
  memo,
} from "react";
import { cn } from "@/lib/utils/cn";

const flipUnitVariants = cva(
  "relative overflow-hidden rounded-md subpixel-antialiased perspective-[1000px]",
  {
    variants: {
      size: {
        sm: "h-14 min-w-10 w-10 text-3xl",
        md: "h-20 min-w-14 w-14 text-5xl",
        lg: "h-24 min-w-[4.25rem] w-[4.25rem] text-6xl",
        xl: "h-32 min-w-[5.5rem] w-[5.5rem] text-8xl",
      },
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-red-600 text-white",
        outline: "border border-input bg-background text-foreground",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

interface FlipUnitProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flipUnitVariants> {
  digit: number | string;
}

const commonCardStyle = cn("absolute inset-x-0 h-1/2 overflow-hidden bg-inherit text-inherit");

const FlipUnit: FC<FlipUnitProps> = memo(function FlipUnit({
  digit,
  size,
  variant,
  className,
  style,
}: FlipUnitProps) {
  return (
    <div className={cn(flipUnitVariants({ size, variant }), className)} style={style}>
      <div className={cn(commonCardStyle, "top-0 rounded-t-lg")}>
        <DigitSpan position="top">{digit}</DigitSpan>
      </div>

      <div className={cn(commonCardStyle, "translate-y-full rounded-b-lg")}>
        <DigitSpan position="bottom">{digit}</DigitSpan>
      </div>

      <div
        className={cn(commonCardStyle, "z-20 origin-bottom rounded-t-lg backface-hidden animate-flip-top")}
      >
        <DigitSpan position="top">{digit}</DigitSpan>
      </div>

      <div
        className={cn(commonCardStyle, "z-10 translate-y-full origin-top rounded-b-lg backface-hidden animate-flip-bottom")}
        style={{ transform: "rotateX(90deg)" }}
      >
        <DigitSpan position="bottom">{digit}</DigitSpan>
      </div>

      <div className="absolute top-1/2 left-0 z-30 h-px w-full -translate-y-1/2 bg-background/50" />
    </div>
  );
});

interface DigitSpanProps {
  children: ReactNode;
  position?: "top" | "bottom";
}

function DigitSpan({ children, position }: DigitSpanProps) {
  return (
    <span
      className="absolute right-0 left-0 flex h-[200%] w-full items-center justify-center"
      style={{ top: position === "top" ? "0%" : "-100%" }}
    >
      {children}
    </span>
  );
}

type FlipClockSize = NonNullable<VariantProps<typeof flipUnitVariants>["size"]>;

const heightMap: Record<FlipClockSize, string> = {
  sm: "text-4xl",
  md: "text-5xl",
  lg: "text-6xl",
  xl: "text-8xl",
};

function ClockSeparator({ size, color }: { size?: FlipClockSize; color?: string }) {
  return (
    <span
      className={cn("-translate-y-[8%] text-center", size ? heightMap[size] : heightMap.md)}
      style={color ? { color } : undefined}
    >
      :
    </span>
  );
}

const flipClockVariants = cva("relative flex items-center justify-center font-mono font-medium", {
  variants: {
    size: {
      sm: "space-x-1 text-3xl",
      md: "space-x-2 text-5xl",
      lg: "space-x-2 text-6xl",
      xl: "space-x-3 text-8xl",
    },
    variant: {
      default: "",
      secondary: "",
      destructive: "",
      outline: "",
      muted: "",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

interface FlipClockProps
  extends VariantProps<typeof flipClockVariants>,
    HTMLAttributes<HTMLDivElement> {
  remainingSeconds: number;
  showDays?: boolean;
  digitColor?: string;
  digitFontSize?: number;
  digitFontFamily?: string;
}

export function FlipClock({
  remainingSeconds,
  showDays = false,
  size,
  variant,
  className,
  digitColor,
  digitFontSize,
  digitFontFamily,
  ...props
}: FlipClockProps) {
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const daysStr = String(days).padStart(3, "0");
  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  const unitStyle: CSSProperties = {
    ...(digitColor ? { color: digitColor } : {}),
    ...(digitFontSize ? { fontSize: digitFontSize } : {}),
    ...(digitFontFamily ? { fontFamily: digitFontFamily } : {}),
  };

  return (
    <div
      className={cn(flipClockVariants({ size, variant }), className)}
      aria-live="polite"
      aria-label={`${showDays ? `${days} days ` : ""}${hours} hours ${minutes} minutes ${seconds} seconds remaining`}
      {...props}
    >
      {showDays && (
        <>
          {daysStr.split("").map((digit, index) => (
            <FlipUnit
              key={`d-${index}-${digit}`}
              digit={digit}
              size={size}
              variant={variant}
              style={unitStyle}
            />
          ))}
          <ClockSeparator size={size ?? "md"} color={digitColor} />
        </>
      )}

      {hoursStr.split("").map((digit, index) => (
        <FlipUnit key={`h-${index}-${digit}`} digit={digit} size={size} variant={variant} style={unitStyle} />
      ))}
      <ClockSeparator size={size ?? "md"} color={digitColor} />

      {minutesStr.split("").map((digit, index) => (
        <FlipUnit key={`m-${index}-${digit}`} digit={digit} size={size} variant={variant} style={unitStyle} />
      ))}
      <ClockSeparator size={size ?? "md"} color={digitColor} />

      {secondsStr.split("").map((digit, index) => (
        <FlipUnit key={`s-${index}-${digit}`} digit={digit} size={size} variant={variant} style={unitStyle} />
      ))}

      <style>{`
        .animate-flip-top { animation: flip-top-anim 0.6s ease-in forwards; }
        .animate-flip-bottom { animation: flip-bottom-anim 0.6s ease-out forwards; }

        @keyframes flip-top-anim {
          0% { transform: rotateX(0deg); z-index: 30; }
          50%, 100% { transform: rotateX(-90deg); z-index: 10; }
        }

        @keyframes flip-bottom-anim {
          0%, 50% { transform: rotateX(90deg); z-index: 10; }
          100% { transform: rotateX(0deg); z-index: 30; }
        }
      `}</style>
    </div>
  );
}
