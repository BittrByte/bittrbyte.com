import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getSessionProfile,
  isAccessValid,
} from "@/lib/labs/access";
import { logoutAction } from "@/app/labs/login/actions";
import type { LabsProfile } from "@/lib/types";

export async function LabsAppChrome({
  children,
  current,
}: {
  children: React.ReactNode;
  current?: string;
}) {
  const { profile } = await getSessionProfile();
  if (!isAccessValid(profile)) {
    redirect("/labs/login");
  }

  return (
    <LabsChromeInner profile={profile!} current={current}>
      {children}
    </LabsChromeInner>
  );
}

function LabsChromeInner({
  children,
  current,
  profile,
}: {
  children: React.ReactNode;
  current?: string;
  profile: LabsProfile;
}) {
  const links = [
    { href: "/labs", label: "Dashboard", key: "dashboard" },
    { href: "/labs/releases", label: "Releases", key: "releases" },
    { href: "/labs/feed", label: "Feed", key: "feed" },
    { href: "/labs/account", label: "Account", key: "account" },
  ];

  if (profile.role === "admin") {
    links.push({ href: "/labs/admin", label: "Admin", key: "admin" });
  }

  return (
    <div className="labs-shell">
      <header className="labs-nav">
        <Link href="/labs" className="labs-brand">
          <strong>SKYWALL</strong>
          <span>Labs</span>
        </Link>
        <nav className="labs-nav__links" aria-label="Labs">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={current === link.key ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <button className="btn" type="submit">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="labs-main">{children}</main>
    </div>
  );
}
