import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Behind a reverse proxy (e.g., DigitalOcean), request.url is internal (localhost).
  // Use forwarded headers to get the real public origin.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile exists (creates family + profile if first login)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          // Create family, profile, and family member
          const { data: family } = await supabase
            .from("families")
            .insert({})
            .select("id")
            .single();

          if (family) {
            await supabase.from("profiles").insert({
              id: user.id,
              family_id: family.id,
              name: user.user_metadata?.name || "Parent",
            });

            await supabase.from("family_members").insert({
              family_id: family.id,
              user_id: user.id,
              role: "owner",
            });
          }
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
