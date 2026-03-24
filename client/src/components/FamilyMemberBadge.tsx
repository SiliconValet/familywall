interface FamilyMemberBadgeProps {
  name: string;
  color: string;
  size?: number;
}

export function FamilyMemberBadge({ name, color }: FamilyMemberBadgeProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}
