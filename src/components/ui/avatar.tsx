interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "none";
  className?: string;
}

export default function Avatar({
  name,
  imageUrl,
  size = "md",
  status = "none",
  className = "",
}: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };

  const statusColors = {
    online: "bg-emerald-400",
    offline: "bg-slate-500",
    busy: "bg-red-400",
    none: "",
  };

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
    >
      <div
        role="img"
        aria-label={`${name}'s profile picture`}
        className={`flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-violet-600 via-purple-700 to-cyan-600 font-display font-bold text-white shadow-lg shadow-violet-900/20 ${sizes[size]}`}
        style={
          imageUrl
            ? {
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!imageUrl && (initials || "?")}
      </div>

      {status !== "none" && (
        <span
          aria-label={`Status: ${status}`}
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#080b18] ${statusColors[status]}`}
        />
      )}
    </div>
  );
}
