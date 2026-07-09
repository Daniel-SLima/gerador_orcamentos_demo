import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  return NextResponse.json({
    success: true,
    email,
    newPassword: "demo1234",
    demo: true,
  });
}
