import { useState, type FormEvent } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useLogin } from "@/hooks/useAuth";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { formatPhone, rawPhone } from "@/lib/phone-mask";
import * as authApi from "@/api/auth";

type ResetStep = "phone" | "code" | "newpass";

/* ─── LoginPage ──────────────────────────────────────────────────────────── */

export function LoginPage() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("+7");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { login, isLoading, error } = useLogin();
  const isDesktop = useIsDesktop();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try { await login({ phone: rawPhone(phone), password }); } catch { /* error in hook */ }
  }

  /* Desktop */
  if (isDesktop) {
    return (
      <div style={{ display: "flex", height: "100dvh" }}>
        {/* Left panel */}
        <div style={{
          width: "44%", background: "var(--sidebar-bg)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 60px", position: "relative", overflow: "hidden",
        }}>
          {/* decorative blobs */}
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "var(--brand)", opacity: 0.06, top: -80, right: -80 }} />
          <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "var(--brand)", opacity: 0.04, bottom: -60, left: -60 }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "var(--radius-lg)",
              background: "var(--brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>M</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>MoozTau</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 12, lineHeight: 1.6, maxWidth: 340 }}>
              {t("login.brandTagline")}
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          flex: 1, background: "var(--bg-surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 60px",
        }}>
          {showReset
            ? <ResetPasswordFlow onBack={() => setShowReset(false)} />
            : (
              <div style={{ width: 360, maxWidth: "100%" }}>
                <h2 className="text-2xl font-bold tracking-tight" style={{ marginBottom: 6 }}>{t("login.title")}</h2>
                <p className="text-sm text-secondary" style={{ marginBottom: 28 }}>{t("login.subtitle")}</p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">{t("login.phoneLabel")}</label>
                    <input id="phone" className="input input-lg" type="tel" inputMode="tel" autoComplete="tel" required
                      placeholder={t("login.phonePlaceholder")} value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pw" className="form-label">{t("login.passwordLabel")}</label>
                    <div style={{ position: "relative" }}>
                      <input id="pw" className="input input-lg" type={showPw ? "text" : "password"}
                        autoComplete="current-password" required placeholder={t("login.passwordPlaceholder")}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        style={{ paddingRight: 42 }} />
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{
                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center",
                      }}>
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                  </div>

                  {error && <AlertBox variant="danger">{error}</AlertBox>}

                  <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>
                    {isLoading ? t("login.submitting") : t("login.submit")}
                  </button>

                  <div style={{ textAlign: "center" }}>
                    <button type="button" onClick={() => setShowReset(true)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--brand)" }}>
                      {t("login.forgotPassword")}
                    </button>
                  </div>
                </form>
              </div>
            )
          }
        </div>
      </div>
    );
  }

  /* Mobile */
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Header */}
      <div style={{
        background: "var(--sidebar-bg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "52px 24px 48px",
        gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "var(--radius-lg)",
          background: "var(--brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>M</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>MoozTau</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{t("login.brandTaglineShort")}</p>
        </div>
      </div>

      {showReset
        ? <ResetPasswordFlow onBack={() => setShowReset(false)} />
        : (
          <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 20px", gap: 16 }}>
            <div className="form-group">
              <label htmlFor="phone-m" className="form-label">{t("login.phoneLabel")}</label>
              <input id="phone-m" className="input input-lg" type="tel" inputMode="tel" autoComplete="tel" required
                placeholder={t("login.phonePlaceholder")} value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))} />
            </div>

            <div className="form-group">
              <label htmlFor="pw-m" className="form-label">{t("login.passwordLabel")}</label>
              <div style={{ position: "relative" }}>
                <input id="pw-m" className="input input-lg" type={showPw ? "text" : "password"}
                  autoComplete="current-password" required placeholder={t("login.passwordPlaceholder")}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center",
                }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {error && <AlertBox variant="danger">{error}</AlertBox>}

            <div style={{ flex: 1 }} />

            <button type="submit" disabled={isLoading} className="btn btn-primary btn-xl" style={{ width: "100%" }}>
              {isLoading ? t("login.submitting") : t("login.submit")}
            </button>

            <div style={{ textAlign: "center" }}>
              <button type="button" onClick={() => setShowReset(true)}
                className="btn btn-ghost btn-sm" style={{ color: "var(--brand)" }}>
                {t("login.forgotPassword")}
              </button>
            </div>
          </form>
        )
      }
    </div>
  );
}

/* ─── ResetPasswordFlow ──────────────────────────────────────────────────── */

function ResetPasswordFlow({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [step, setStep] = useState<ResetStep>("phone");
  const [phone, setPhone] = useState("+7");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function requestCode() {
    setError(""); setLoading(true);
    try { await authApi.requestReset(rawPhone(phone)); setStep("code"); }
    catch (e: any) { setError(e?.response?.data?.detail ?? t("login.reset.errors.sendFailed")); }
    finally { setLoading(false); }
  }
  function verifyCode() {
    setError("");
    if (code.length !== 6) { setError(t("login.reset.errors.codeLength")); return; }
    setStep("newpass");
  }
  async function resetPw() {
    setError("");
    if (newPw !== confirmPw) { setError(t("login.reset.errors.passwordMismatch")); return; }
    if (newPw.length < 6) { setError(t("login.reset.errors.passwordTooShort")); return; }
    setLoading(true);
    try { await authApi.resetPassword(rawPhone(phone), code, newPw); setSuccess(true); setTimeout(onBack, 2000); }
    catch (e: any) { setError(e?.response?.data?.detail ?? t("login.reset.errors.resetFailed")); }
    finally { setLoading(false); }
  }

  const STEPS = [t("login.reset.stepPhone"), t("login.reset.stepCode"), t("login.reset.stepPassword")];
  const stepIdx = step === "phone" ? 0 : step === "code" ? 1 : 2;

  const wrap = isDesktop
    ? { width: 360, maxWidth: "100%" }
    : { flex: 1, display: "flex" as const, flexDirection: "column" as const, padding: "28px 20px", gap: 20 };

  return (
    <div style={wrap}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginBottom: 16, gap: 5, color: "var(--text-secondary)" }}>
        <ChevronLeft /> {t("common.back")}
      </button>

      <div style={{ marginBottom: 24 }}>
        <h2 className="text-xl font-bold tracking-tight" style={{ marginBottom: 4 }}>{t("login.reset.title")}</h2>
        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: i <= stepIdx ? "var(--brand)" : "var(--bg-muted)",
                color: i <= stepIdx ? "#fff" : "var(--text-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, transition: "background var(--t-base)",
              }}>
                {i < stepIdx ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: i === stepIdx ? 600 : 400, color: i <= stepIdx ? "var(--text-default)" : "var(--text-muted)" }}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{ width: 16, height: 1, background: i < stepIdx ? "var(--brand)" : "var(--border)", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {step === "phone" && (
          <>
            <p className="text-sm text-secondary">{t("login.reset.phoneHint")}</p>
            <div className="form-group">
              <label className="form-label">{t("login.phoneLabel")}</label>
              <input className="input input-lg" type="tel" inputMode="tel" placeholder={t("login.phonePlaceholder")}
                value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
            </div>
            {error && <AlertBox variant="danger">{error}</AlertBox>}
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={requestCode} disabled={loading}>
              {loading ? t("login.reset.sending") : t("login.reset.sendCode")}
            </button>
          </>
        )}

        {step === "code" && (
          <>
            <p className="text-sm text-secondary">
              <Trans i18nKey="login.reset.codeHint" values={{ phone }} components={{ 1: <strong /> }} />
            </p>
            <div className="form-group">
              <label className="form-label">{t("login.reset.codeLabel")}</label>
              <input className="input input-lg" type="text" inputMode="numeric" maxLength={6} placeholder={t("login.reset.codePlaceholder")}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                style={{ letterSpacing: 10, fontSize: 20, fontWeight: 700, textAlign: "center" }} />
            </div>
            {error && <AlertBox variant="danger">{error}</AlertBox>}
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={verifyCode}>{t("login.reset.confirm")}</button>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => { setStep("phone"); setCode(""); setError(""); }}>
              {t("login.reset.resend")}
            </button>
          </>
        )}

        {step === "newpass" && (
          <>
            <p className="text-sm text-secondary">{t("login.reset.newPasswordHint")}</p>
            <div className="form-group">
              <label className="form-label">{t("login.reset.newPasswordLabel")}</label>
              <div style={{ position: "relative" }}>
                <input className="input input-lg" type={showPw ? "text" : "password"} placeholder={t("login.passwordPlaceholder")}
                  value={newPw} onChange={(e) => setNewPw(e.target.value)} style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center" }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t("login.reset.repeatPasswordLabel")}</label>
              <input className="input input-lg" type="password" placeholder={t("login.passwordPlaceholder")}
                value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
            {error && <AlertBox variant="danger">{error}</AlertBox>}
            {success && <AlertBox variant="success">{t("login.reset.successMessage")}</AlertBox>}
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={resetPw} disabled={loading || success}>
              {loading ? t("login.reset.saving") : t("login.reset.savePassword")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function AlertBox({ children, variant }: { children: React.ReactNode; variant: "danger" | "success" }) {
  const s = variant === "danger"
    ? { bg: "var(--danger-light)", color: "var(--danger)" }
    : { bg: "var(--success-light)", color: "var(--success-fg)" };
  return (
    <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: s.bg, color: s.color, fontSize: 13, fontWeight: 500 }}>
      {children}
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
