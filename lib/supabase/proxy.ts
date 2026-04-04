import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const getSupabaseEnv = (): { url: string; publishableKey: string } => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!(url && publishableKey)) {
    throw new Error(
      "Missing Supabase client environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return { url, publishableKey };
};

export const updateSession = async (
  request: NextRequest
): Promise<{ response: NextResponse; hasSession: boolean }> => {
  let response = NextResponse.next({
    request,
  });

  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
        }

        response = NextResponse.next({
          request,
        });

        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();

  return {
    response,
    hasSession: !error && Boolean(data?.claims?.sub),
  };
};
