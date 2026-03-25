import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { ensureProfile } from "@/lib/ensure-profile";

export async function POST(request: Request) {
  // Use the user's session to verify identity
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name } = await request.json().catch(() => ({ name: undefined }));

  // Use service role client to bypass RLS for admin operations
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await ensureProfile(adminClient, user.id, name || user.user_metadata?.name || "Parent");

  return NextResponse.json({ ok: true });
}
