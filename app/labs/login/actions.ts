"use server";

import { redirect } from "next/navigation";
import {
  reviewerInternalEmail,
  writeAudit,
} from "@/lib/labs/access";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
  ok?: string;
};

function looksLikeEmail(value: string) {
  return value.includes("@");
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return { error: "Enter your email or username and password." };
  }

  const supabase = await createClient();
  const service = createServiceClient();

  let email = identifier;
  if (!looksLikeEmail(identifier)) {
    const username = identifier.toLowerCase();
    const { data: map } = await service
      .from("labs_reviewer_map")
      .select("auth_user_id, username")
      .eq("username", username)
      .maybeSingle();

    if (!map) {
      return { error: "Invalid credentials." };
    }

    const { data: userData } = await service.auth.admin.getUserById(
      map.auth_user_id
    );
    email = userData.user?.email || reviewerInternalEmail(username);
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    return { error: "Invalid credentials." };
  }

  const { data: profile } = await service
    .from("labs_profiles")
    .select("*")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (!profile || profile.status === "revoked") {
    await supabase.auth.signOut();
    return { error: "Access revoked." };
  }

  if (
    profile.status === "expired" ||
    (profile.access_expires &&
      new Date(profile.access_expires).getTime() <= Date.now())
  ) {
    await service
      .from("labs_profiles")
      .update({ status: "expired" })
      .eq("id", profile.id);
    await supabase.auth.signOut();
    return { error: "Access expired." };
  }

  await service
    .from("labs_profiles")
    .update({
      last_login_at: new Date().toISOString(),
      invitation_status:
        profile.invitation_status === "invited"
          ? "accepted"
          : profile.invitation_status,
    })
    .eq("id", profile.id);

  await writeAudit({
    actorId: profile.id,
    eventType: "login",
    targetType: "profile",
    targetId: profile.id,
  });

  redirect("/labs");
}

export async function forgotPasswordAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return {
      error: "Password reset is only available for email accounts.",
    };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/labs/login`,
  });

  if (error) {
    return { error: "Could not send reset email." };
  }

  return {
    ok: "If that email has access, a reset link was sent.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/labs/login");
}
