export const COLOR_CLASSES: Record<string, { bg: string; border: string }> = {
  red: { bg: "bg-red-500/30", border: "border-red-500" },
  blue: { bg: "bg-blue-500/30", border: "border-blue-500" },
  green: { bg: "bg-green-500/30", border: "border-green-500" },
  yellow: { bg: "bg-yellow-500/30", border: "border-yellow-500" },
  pink: { bg: "bg-pink-500/30", border: "border-pink-500" },
  purple: { bg: "bg-purple-500/30", border: "border-purple-500" },
  orange: { bg: "bg-orange-500/30", border: "border-orange-500" },
  teal: { bg: "bg-teal-500/30", border: "border-teal-500" },
  indigo: { bg: "bg-indigo-500/30", border: "border-indigo-500" },
  cyan: { bg: "bg-cyan-500/30", border: "border-cyan-500" },
};


export default function Marker({ color }: { color: keyof typeof COLOR_CLASSES }) {
  const classes = COLOR_CLASSES[color] || COLOR_CLASSES.red;

  return (
    <div className={`${classes.bg} p-1 rotate-45 rounded-sm`}>
      <div className={`bg-background border-2 p-1 ${classes.border} rounded-sm`} />
    </div>
  );
}
