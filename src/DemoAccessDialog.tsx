import React from "react";

import { isDemoAccessPasswordValid } from "./demoAccess";

export function DemoAccessDialog({
  language,
  onUnlock,
  onCancel,
}: {
  language: "en" | "zh";
  onUnlock: (password: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const chinese = language === "zh";

  return (
    <div className="demoAccessBackdrop">
      <section className="demoAccessDialog" role="dialog" aria-modal="true" aria-labelledby="demo-access-title">
        <h2 id="demo-access-title">{chinese ? "输入访问密码" : "Enter Access Password"}</h2>
        <form onSubmit={async (event) => {
          event.preventDefault();
          if (!isDemoAccessPasswordValid(password)) {
            setError(chinese ? "密码错误，请重试。" : "Incorrect password. Try again.");
            return;
          }
          setError("");
          setSubmitting(true);
          try {
            await onUnlock(password);
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to verify access.");
            setSubmitting(false);
          }
        }}>
          <label className="srOnly" htmlFor="demo-access-password">{chinese ? "密码" : "Password"}</label>
          <input
            id="demo-access-password"
            type="password"
            value={password}
            autoFocus
            autoComplete="current-password"
            disabled={submitting}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "demo-access-error" : undefined}
            placeholder={chinese ? "密码" : "Password"}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError("");
            }}
          />
          <div className="demoAccessError" id="demo-access-error" role={error ? "alert" : undefined}>{error}</div>
          <footer>
            <button type="button" onClick={onCancel} disabled={submitting}>{chinese ? "取消" : "Cancel"}</button>
            <button type="submit" className="primary" disabled={submitting}>{chinese ? "进入演示" : "Continue"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
