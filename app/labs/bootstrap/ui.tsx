"use client";

import { useActionState } from "react";
import { bootstrapAdminAction, type AdminState } from "../admin/actions";

const initial: AdminState = {};

export function BootstrapForm() {
  const [state, action, pending] = useActionState(bootstrapAdminAction, initial);
  return (
    <form className="labs-form" action={action}>
      <div className="labs-field">
        <label htmlFor="bootstrapSecret">Bootstrap secret</label>
        <input id="bootstrapSecret" name="bootstrapSecret" type="password" required />
      </div>
      <div className="labs-field">
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" required />
      </div>
      <div className="labs-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="labs-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} />
      </div>
      {state.error ? <p className="labs-error">{state.error}</p> : null}
      {state.ok ? <p className="labs-ok">{state.ok}</p> : null}
      <button className="btn btn--primary btn--block" disabled={pending}>
        {pending ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
