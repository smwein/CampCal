import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Ensures a profile, family, and family_member exist for the given user.
 * Called after both magic-link and password auth flows.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string,
  name?: string
) {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existingProfile) return;

  const { data: family } = await supabase
    .from("families")
    .insert({})
    .select("id")
    .single();

  if (!family) return;

  await supabase.from("profiles").insert({
    id: userId,
    family_id: family.id,
    name: name || "Parent",
  });

  await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: userId,
    role: "owner",
  });
}
