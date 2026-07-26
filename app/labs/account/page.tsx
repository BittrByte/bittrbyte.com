import { LabsAppChrome } from "@/components/labs/chrome";
import { getSessionProfile } from "@/lib/labs/access";

export default async function AccountPage() {
  const { profile } = await getSessionProfile();

  return (
    <LabsAppChrome current="account">
      <div className="labs-hero-lockup">
        <span className="eyebrow">Account</span>
        <h1>{profile?.display_name}</h1>
        <p>Your Labs access window and permissions.</p>
      </div>
      <section className="labs-panel">
        <table className="labs-table">
          <tbody>
            <tr>
              <th>Role</th>
              <td>{profile?.role}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{profile?.status}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{profile?.email || "—"}</td>
            </tr>
            <tr>
              <th>Username</th>
              <td>{profile?.username || "—"}</td>
            </tr>
            <tr>
              <th>Access start</th>
              <td>
                {profile?.access_start
                  ? new Date(profile.access_start).toLocaleString()
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>Access expires</th>
              <td>
                {profile?.access_expires
                  ? new Date(profile.access_expires).toLocaleString()
                  : "Indefinite"}
              </td>
            </tr>
            <tr>
              <th>Last login</th>
              <td>
                {profile?.last_login_at
                  ? new Date(profile.last_login_at).toLocaleString()
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>Can download</th>
              <td>{profile?.can_download ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <th>Can post</th>
              <td>{profile?.can_post ? "Yes" : "No"}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </LabsAppChrome>
  );
}
