import { useState } from "react";
import { cn } from "@/lib/utils";

export function UserAvatar({ src, className }: { src: string | null | undefined; className?: string }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  return (
    <div className={cn("bg-muted flex items-center justify-center overflow-hidden", className)}>
      {show ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="text-muted-foreground text-xs">?</span>
      )}
    </div>
  );
}
