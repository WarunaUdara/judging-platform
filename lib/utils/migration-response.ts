import { NextResponse } from "next/server";

export const migrationResponse = () => {
  return NextResponse.json(
    {
      error: "Endpoint temporarily unavailable during Supabase migration",
    },
    { status: 503 }
  );
};
