import { BootstrapForm } from "./ui";

export default function BootstrapPage() {
  return (
    <div className="labs-shell labs-login">
      <div className="labs-login__card">
        <div className="labs-brand">
          <strong>SKYWALL</strong>
          <span>Labs setup</span>
        </div>
        <h1>Create first admin</h1>
        <p className="labs-muted" style={{ marginBottom: "1.25rem" }}>
          One-time setup. Uses your <code>LABS_SESSION_SECRET</code> from{" "}
          <code>.env.local</code>. Disabled once an admin already exists.
        </p>
        <BootstrapForm />
      </div>
    </div>
  );
}
