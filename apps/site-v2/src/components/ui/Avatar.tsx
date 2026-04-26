interface AvatarProps {
  name: string;
  bgColor?: string;
}

export function Avatar({ name, bgColor = "var(--main)" }: AvatarProps) {
  const letters = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-serif text-[14px] text-white shrink-0"
      style={{ background: bgColor }}
    >
      {letters}
    </div>
  );
}
