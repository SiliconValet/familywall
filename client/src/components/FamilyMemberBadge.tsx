interface FamilyMemberBadgeProps {
  name: string;
  colorIndex: number;
  size?: number;
}

export function FamilyMemberBadge({ name, colorIndex }: FamilyMemberBadgeProps) {
  const initial = name.charAt(0).toUpperCase();
  const chartColor = `var(--chart-${(colorIndex % 4) + 1})`;

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
      style={{ backgroundColor: chartColor }}
    >
      {initial}
    </div>
  );
}
