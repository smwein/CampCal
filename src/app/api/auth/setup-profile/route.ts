import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name } = await request.json().catch(() => ({ name: undefined }));

  await ensureProfile(supabase, user.id, name || user.user_metadata?.name || "Parent");

  return NextResponse.json({ ok: true });
}
