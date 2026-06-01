import { Check, Copy, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { useT } from "@/i18n";

export function ShareModal({
  fromName,
  buddyName,
  buddyId,
  onClose,
}: {
  fromName: string;
  buddyName: string;
  buddyId: string;
  onClose: () => void;
}) {
  const t = useT();
  const [msgCopied, setMsgCopied] = useState(false);
  const pairUrl = `${location.origin}${location.pathname}#/pair/${encodeURIComponent(fromName)}/${encodeURIComponent(buddyName)}`;
  const profileUrl = `https://app.warera.io/user/${buddyId}`;
  const message = t("share.messageBody", { url: pairUrl });

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 1800);
  };

  return (
    <button type="button" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-card w-full max-w-sm cursor-default rounded-xl border p-5 text-left shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold">{t("share.title", { name: buddyName })}</h2>
          <span className="text-muted-foreground hover:text-foreground" aria-hidden="true">
            <X className="size-4" />
          </span>
        </div>

        <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{t("share.instr", { name: buddyName })}</p>

        <div className="bg-muted/40 mb-3 rounded-lg border p-2.5">
          <div className="label text-muted-foreground mb-1">{t("share.message")}</div>
          <p className="text-foreground/90 text-xs leading-relaxed break-words">{message}</p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <ExternalLink className="size-4" /> {t("share.openProfile", { name: buddyName })}
          </a>
          <button
            type="button"
            onClick={copyMessage}
            className="border-border hover:bg-accent inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            {msgCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {msgCopied ? t("share.messageCopied") : t("share.copyMessage")}
          </button>
        </div>
      </div>
    </button>
  );
}
