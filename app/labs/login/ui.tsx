"use client";

import { useActionState, useState } from "react";
import {
  forgotPasswordAction,
  loginAction,
  type LoginState,
} from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [resetState, resetAction, resetPending] = useActionState(
    forgotPasswordAction,
    initial
  );
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="labs-stack">
      <form className="labs-form" action={action}>
        <div className="labs-field">
          <label htmlFor="identifier">Email or username</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            placeholder="you@example.com or yc-reviewer"
          />
        </div>
        <div className="labs-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state.error ? <p className="labs-error">{state.error}</p> : null}
        <button className="btn btn--primary btn--block" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        className="btn btn--block"
        onClick={() => setShowReset((v) => !v)}
      >
        {showReset ? "Hide password reset" : "Forgot password (email only)"}
      </button>

      {showReset ? (
        <form className="labs-form" action={resetAction}>
          <div className="labs-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          {resetState.error ? (
            <p className="labs-error">{resetState.error}</p>
          ) : null}
          {resetState.ok ? <p className="labs-ok">{resetState.ok}</p> : null}
          <button className="btn btn--block" disabled={resetPending}>
            {resetPending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
