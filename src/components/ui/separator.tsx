interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  decorative?: boolean;
}

export default function Separator({
  orientation = "horizontal",
  className = "",
  decorative = true,
}: SeparatorProps) {
  return (
    <div
      role={decorative ? "presentation" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={`shrink-0 ${
        orientation === "horizontal"
          ? "h-px w-full"
          : "h-full w-px"
      } bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`}
    />
  );
}
