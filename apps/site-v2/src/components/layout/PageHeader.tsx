import { cn } from "@/lib/cn";

interface PageHeaderProps {
  num: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  lead?: string;
  className?: string;
}

export function PageHeader({
  num,
  eyebrow,
  title,
  titleAccent,
  lead,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "page-header relative overflow-hidden",
        "py-[clamp(56px,8vw,120px)] pb-[clamp(40px,5vw,64px)]",
        "bg-[var(--body)] text-white",
        className
      )}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-[-100px] right-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(242,211,129,0.12) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div className="wrap relative z-10">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--btn)] mb-4">
          &mdash; {num} &middot; {eyebrow}
        </div>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 7vw, 84px)" }}>
          {title}{" "}
          {titleAccent && (
            <em style={{ color: "var(--btn)", fontStyle: "italic" }}>
              {titleAccent}
            </em>
          )}
        </h1>
        {lead && (
          <p
            className="lead mt-6"
            style={{ maxWidth: 640, color: "rgba(255,255,255,0.78)" }}
          >
            {lead}
          </p>
        )}
      </div>
    </header>
  );
}
