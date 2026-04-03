"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  type HTMLAttributes,
  memo,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils/cn";

const flipUnitVariants = cva(
  "perspective-[1000px] relative overflow-hidden rounded-md border subpixel-antialiased",
  {
    variants: {
      size: {
        sm: "h-12 w-9 min-w-9 text-2xl sm:h-14 sm:w-10 sm:min-w-10 sm:text-3xl",
        md: "h-16 w-12 min-w-12 text-4xl sm:h-20 sm:w-14 sm:min-w-14 sm:text-5xl",
        lg: "h-20 w-14 min-w-14 text-5xl sm:h-24 sm:w-17 sm:min-w-17 sm:text-6xl",
        xl: "h-28 w-20 min-w-20 text-7xl sm:h-32 sm:w-22 sm:min-w-22 sm:text-8xl",
      },
      variant: {
        default: "border-[--timer-border] bg-[--timer-background] text-[--timer-primary]",
        secondary: "border-[--timer-border] bg-[--timer-card] text-[--timer-foreground]",
        destructive: "border-[--timer-destructive] bg-[--timer-destructive]/10 text-[--timer-destructive]",
        outline: "border-[--timer-border] bg-[--timer-background] text-[--timer-primary]",
        muted: "border-[--timer-border] bg-[--timer-muted] text-[--timer-muted-foreground]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

interface FlipUnitProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flipUnitVariants> {
  digit: number | string;
}

const commonCardStyle = cn(
  "absolute inset-x-0 h-1/2 overflow-hidden bg-inherit text-inherit"
);

const FlipUnit = memo(function FlipUnit({
  digit,
  size,
  variant,
  className,
}: FlipUnitProps) {
  const [prevDigit, setPrevDigit] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const showCorners = variant === "default" || variant === "outline";

  useEffect(() => {
    if (digit !== prevDigit) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setFlipping(false);
        setPrevDigit(digit);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div className={cn(flipUnitVariants({ size, variant }), className)}>
      {/* Static top half - current digit */}
      <div className={cn(commonCardStyle, "top-0 rounded-t-lg")}>
        <DigitSpan position="top">{digit}</DigitSpan>
      </div>

      {/* Static bottom half - previous digit */}
      <div className={cn(commonCardStyle, "translate-y-full rounded-b-lg")}>
        <DigitSpan position="bottom">{prevDigit}</DigitSpan>
      </div>

      {/* Animated top flip - previous digit */}
      <div
        className={cn(
          commonCardStyle,
          "backface-hidden z-20 origin-bottom rounded-t-lg",
          flipping && "animate-flip-top"
        )}
      >
        <DigitSpan position="top">{prevDigit}</DigitSpan>
      </div>

      {/* Animated bottom flip - current digit */}
      <div
        className={cn(
          commonCardStyle,
          "backface-hidden z-10 origin-top translate-y-full rounded-b-lg",
          flipping && "animate-flip-bottom"
        )}
        style={{ transform: "rotateX(90deg)" }}
      >
        <DigitSpan position="bottom">{digit}</DigitSpan>
      </div>

      {/* Center divider line */}
      <div className="absolute top-1/2 left-0 z-30 h-px w-full -translate-y-1/2 bg-[--timer-border]" />

      {/* Corner accent marks - 8 corners (L-shaped) */}
      {showCorners && (
        <>
          {/* Top-left corner */}
          <span className="absolute top-0 left-0 z-40 h-[6px] w-px bg-[--timer-primary]" />
          <span className="absolute top-0 left-0 z-40 h-px w-[6px] bg-[--timer-primary]" />
          {/* Top-right corner */}
          <span className="absolute top-0 right-0 z-40 h-[6px] w-px bg-[--timer-primary]" />
          <span className="absolute top-0 right-0 z-40 h-px w-[6px] bg-[--timer-primary]" />
          {/* Bottom-left corner */}
          <span className="absolute bottom-0 left-0 z-40 h-[6px] w-px bg-[--timer-primary]" />
          <span className="absolute bottom-0 left-0 z-40 h-px w-[6px] bg-[--timer-primary]" />
          {/* Bottom-right corner */}
          <span className="absolute right-0 bottom-0 z-40 h-[6px] w-px bg-[--timer-primary]" />
          <span className="absolute right-0 bottom-0 z-40 h-px w-[6px] bg-[--timer-primary]" />
        </>
      )}
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

const flipClockVariants = cva(
  "relative flex items-center justify-center font-['Hacked_KerX'] font-medium",
  {
    variants: {
      size: {
        sm: "gap-1 sm:gap-2",
        md: "gap-1.5 sm:gap-2",
        lg: "gap-2",
        xl: "gap-2.5 sm:gap-3",
      },
      variant: {
        default: "text-[--timer-primary]",
        secondary: "text-[--timer-foreground]",
        destructive: "text-[--timer-destructive]",
        outline: "text-[--timer-primary]",
        muted: "text-[--timer-muted-foreground]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

interface FlipClockProps
  extends VariantProps<typeof flipClockVariants>,
    HTMLAttributes<HTMLDivElement> {
  countdown?: boolean;
  showDays?: "auto" | "always" | "never";
  targetDate?: Date;
  remainingSeconds?: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type FlipClockSize = NonNullable<
  VariantProps<typeof flipClockVariants>["size"]
>;

function UnitLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-['Uncut_Sans'] text-[10px] text-[--timer-muted-foreground] uppercase tracking-[0.2em]">
      {children}
    </span>
  );
}

interface ClockGroupProps {
  digits: [string, string];
  label: string;
  size: FlipClockSize;
  variant?: VariantProps<typeof flipClockVariants>["variant"];
}

function ClockGroup({ digits, label, size, variant }: ClockGroupProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <FlipUnit digit={digits[0]} size={size} variant={variant} />
        <FlipUnit digit={digits[1]} size={size} variant={variant} />
      </div>
      <UnitLabel>{label}</UnitLabel>
    </div>
  );
}

const ZERO_TIME: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export function FlipClock({
  countdown = false,
  targetDate,
  remainingSeconds,
  size,
  variant,
  showDays = "auto",
  className,
  ...props
}: FlipClockProps) {
  const resolvedSize: FlipClockSize = size ?? "md";

  // Initialize with zeroes to avoid SSR/client hydration mismatch
  const [time, setTime] = useState<TimeLeft>(ZERO_TIME);

  useEffect(() => {
    // Sync to real time after mount
    setTime(getTime(countdown, targetDate, remainingSeconds));

    const timer = setInterval(() => {
      const nextTime = getTime(countdown, targetDate, remainingSeconds);
      setTime((prev) => {
        // Only update if time actually changed
        if (
          prev.days === nextTime.days &&
          prev.hours === nextTime.hours &&
          prev.minutes === nextTime.minutes &&
          prev.seconds === nextTime.seconds
        ) {
          return prev;
        }
        return nextTime;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [countdown, targetDate, remainingSeconds]);

  const daysStr = String(time.days).padStart(2, "0").slice(-2);
  const hoursStr = String(time.hours).padStart(2, "0");
  const minutesStr = String(time.minutes).padStart(2, "0");
  const secondsStr = String(time.seconds).padStart(2, "0");

  const shouldShowDays =
    countdown &&
    (showDays === "always" || (showDays === "auto" && time.days > 0));

  const [dayTens = "0", dayOnes = "0"] = daysStr;
  const [hourTens = "0", hourOnes = "0"] = hoursStr;
  const [minuteTens = "0", minuteOnes = "0"] = minutesStr;
  const [secondTens = "0", secondOnes = "0"] = secondsStr;

  return (
    <div
      aria-live="polite"
      className={cn(
        flipClockVariants({ size: resolvedSize, variant }),
        "flex flex-row flex-wrap justify-center gap-6 sm:gap-5 md:flex-nowrap md:gap-6",
        className
      )}
      {...props}
    >
      <span className="sr-only absolute">
        {`${time.hours}:${time.minutes}:${time.seconds}`}
      </span>

      {shouldShowDays && (
        <ClockGroup
          digits={[dayTens, dayOnes]}
          label="Days"
          size={resolvedSize}
          variant={variant}
        />
      )}

      <ClockGroup
        digits={[hourTens, hourOnes]}
        label="Hours"
        size={resolvedSize}
        variant={variant}
      />

      <ClockGroup
        digits={[minuteTens, minuteOnes]}
        label="Minutes"
        size={resolvedSize}
        variant={variant}
      />

      <ClockGroup
        digits={[secondTens, secondOnes]}
        label="Seconds"
        size={resolvedSize}
        variant={variant}
      />
    </div>
  );
}

function getTime(countdown: boolean, targetDate?: Date, remainingSeconds?: number): TimeLeft {
  const now = new Date();

  // If remainingSeconds is provided, use it directly
  if (remainingSeconds !== undefined) {
    const total = Math.max(0, remainingSeconds);
    return {
      days: Math.floor(total / (60 * 60 * 24)),
      hours: Math.floor((total / (60 * 60)) % 24),
      minutes: Math.floor((total / 60) % 60),
      seconds: Math.floor(total % 60),
    };
  }

  if (!countdown) {
    return {
      days: 0,
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
    };
  }

  if (!targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
