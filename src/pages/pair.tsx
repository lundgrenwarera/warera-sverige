import { AlertTriangle, HeartHandshake, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { findPlayer, usePool } from "@/api/pool";
import { matchPercent } from "@/features/buddy/matching";
import { useT } from "@/i18n";
import { MoneyText } from "@/shared/components/money";
import { UserAvatar } from "@/shared/components/user-avatar";

export function PairPage() {
  const { from = "", to = "" } = useParams();
  const t = useT();
  const pool = usePool();

  const a = pool.data ? findPlayer(pool.data, from) : undefined;
  const b = pool.data ? findPlayer(pool.data, to) : undefined;
  const pct = a && b ? matchPercent(a, b) : null;
  const recipientTax = b ? Math.round(b.taxPerDay) : 0;
  const combined = Math.round((a?.taxPerDay ?? 0) + (b?.taxPerDay ?? 0));

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="space-y-5 rise-in">
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <UserAvatar src={a?.avatar} className="size-12 rounded-xl" />
            <HeartHandshake className="text-primary size-6" />
            <UserAvatar src={b?.avatar} className="size-12 rounded-xl" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">{t("pair.heading", { from })}</h1>
        </div>

        <section className="bg-card rounded-xl border p-4">
          <div className="label text-primary mb-1.5">{t("pair.what")}</div>
          <p className="text-muted-foreground text-sm leading-relaxed">{t("pair.explain")}</p>
        </section>

        <section
          className={
            recipientTax > 0
              ? "border-destructive/40 bg-destructive/5 rounded-xl border p-4"
              : "border-chart-2/40 bg-chart-2/5 rounded-xl border p-4"
          }
        >
          <div className="label text-primary mb-1.5">{t("pair.yourImpact")}</div>
          {recipientTax > 0 ? (
            <div className="text-destructive flex items-start gap-2 text-sm font-medium">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                <MoneyText>{t("pair.youLeak", { amount: recipientTax, country: b?.employer ?? "?" })}</MoneyText>
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t("pair.youClean")}</p>
          )}
        </section>

        <section className="bg-card rounded-xl border p-4">
          <div className="text-primary mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="size-4" />
            <span className="label">{t("pair.fix")}</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{t("pair.fixText", { from })}</p>
          {combined > 0 && (
            <p className="text-destructive mt-2 text-sm font-medium">
              <MoneyText>{t("pair.impact", { from, amount: combined })}</MoneyText>
            </p>
          )}
          {pct != null && <p className="text-chart-2 mt-2 text-sm font-medium">{t("pair.match", { n: pct })}</p>}
        </section>
      </div>
    </div>
  );
}
