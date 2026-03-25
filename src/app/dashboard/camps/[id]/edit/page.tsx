import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CampEditForm from "./camp-edit-form";

export default async function EditCampPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: camp } = await supabase
    .from("camps")
    .select("*")
    .eq("id", id)
    .eq("created_by_user_id", user.id)
    .single();

  if (!camp) return notFound();

  const { data: session } = await supabase
    .from("camp_sessions")
    .select("*")
    .eq("camp_id", id)
    .single();

  const { data: assignments } = session
    ? await supabase
        .from("assignments")
        .select("id, kid_id")
        .eq("camp_session_id", session.id)
    : { data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", user.id)
    .single();

  const { data: kids } = await supabase
    .from("kids")
    .select("id, name, color")
    .eq("family_id", profile?.family_id)
    .order("created_at");

  return (
    <CampEditForm
      camp={camp}
      session={session}
      assignments={assignments ?? []}
      kids={kids ?? []}
    />
  );
}
