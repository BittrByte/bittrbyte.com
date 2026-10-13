import Link from "next/link";
import { LoginForm } from "./ui";

export default function LabsLoginPage() {
  return (
    <div className="labs-shell labs-login">
      <div className="labs-login__card">
        <div className="labs-brand">
          <strong>SKYWALL</strong>
          <span>Labs</span>
        </div>
        <h1>Sign in</h1>
        <p className="labs-muted" style={{ marginBottom: "1.25rem" }}>
          Access is invite-only. Use the email or username you were given.
        </p>
        <LoginForm />
        <p className="labs-muted" style={{ marginTop: "1.25rem" }}>
          No access yet?{" "}
          <Link href="/developers.html">Apply on the Labs page</Link>.
        </p>
      </div>
    </div>
  );
}
