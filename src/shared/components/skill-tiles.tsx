import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const GLYPH_SHADOW = "drop-shadow(0 1px 0 rgba(0,0,0,0.6))";

const STYLE = {
  energy: {
    path: "M11 15H6L13 1V9H18L11 23V15Z",
    accent: "rgb(130,160,227)",
    from: "rgb(30,63,136)",
    to: "rgb(23,49,104)",
    key: "common.energy" as const,
  },
  production: {
    path: "M14.79,10.62L3.5,21.9L2.1,20.5L13.38,9.21L14.79,10.62M19.27,7.73L19.86,7.14L19.07,6.35L19.71,5.71L18.29,4.29L17.65,4.93L16.86,4.14L16.27,4.73C14.53,3.31 12.57,2.17 10.47,1.37L9.64,3.16C11.39,4.08 13,5.19 14.5,6.5L14,7L17,10L17.5,9.5C18.81,11 19.92,12.61 20.84,14.36L22.63,13.53C21.83,11.43 20.69,9.47 19.27,7.73Z",
    accent: "rgb(214,187,130)",
    from: "rgb(112,88,37)",
    to: "rgb(86,68,28)",
    key: "common.production" as const,
  },
};

type Kind = keyof typeof STYLE;

function Glyph({ path, className, style }: { path: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      aria-hidden="true"
      className={cn("inline-block", className)}
      style={style}
    >
      <path d={path} />
    </svg>
  );
}

export function SkillTiles({ kind, level, size = "md" }: { kind: Kind; level: number; size?: "md" | "sm" }) {
  const t = useT();
  const def = STYLE[kind];
  const track = Math.max(10, level);
  const tile = size === "sm" ? "h-6 w-4 text-[14px]" : "h-8 w-5 text-[17px]";

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Glyph
          path={def.path}
          className={size === "sm" ? "text-xs" : "text-base"}
          style={{ color: def.accent, filter: GLYPH_SHADOW }}
        />
        <span
          className={cn("font-mono font-bold tabular-nums", size === "sm" ? "text-sm" : "text-lg")}
          style={{ color: def.accent }}
        >
          {level}
        </span>
        <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>{t(def.key)}</span>
      </div>
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: track }, (_, i) => {
          const lvl = i + 1;
          const have = lvl <= level;
          return (
            <span
              key={lvl}
              className={cn("flex items-center justify-center rounded-[2px] border", tile)}
              style={
                have
                  ? {
                      backgroundImage: `linear-gradient(45deg, ${def.from}, ${def.to})`,
                      borderColor: def.accent,
                      color: def.accent,
                    }
                  : { borderColor: "var(--border)" }
              }
            >
              {have && <Glyph path={def.path} style={{ filter: GLYPH_SHADOW }} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
