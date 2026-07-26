export type LabsRole = "reviewer" | "member" | "admin";
export type LabsStatus = "active" | "expired" | "revoked";
export type LabsInviteStatus = "none" | "invited" | "accepted";

export type LabsProfile = {
  id: string;
  auth_user_id: string;
  display_name: string;
  email: string | null;
  username: string | null;
  role: LabsRole;
  access_start: string;
  access_expires: string | null;
  status: LabsStatus;
  can_download: boolean;
  can_post: boolean;
  last_login_at: string | null;
  invitation_status: LabsInviteStatus;
  created_at: string;
  updated_at: string;
};

export type LabsRelease = {
  id: string;
  version: string;
  released_at: string;
  device: string;
  channel: string;
  status: string;
  filename: string | null;
  storage_path: string | null;
  size_bytes: number | null;
  sha256: string | null;
  summary: string | null;
  notes: string | null;
  known_issues: string | null;
  install_notes: string | null;
  download_enabled: boolean;
  is_latest: boolean;
  created_at: string;
};

export type LabsEvidence = {
  id: string;
  title: string;
  caption: string | null;
  media_type: string;
  media_url: string | null;
  storage_path: string | null;
  sort_order: number;
  published_at: string;
};

export type LabsPost = {
  id: string;
  author_id: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  author?: Pick<LabsProfile, "display_name" | "role" | "username"> | null;
};

export type LabsComment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Pick<LabsProfile, "display_name" | "role" | "username"> | null;
};
