import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "E-mail e obrigatorio." }, { status: 400 });

  return NextResponse.json({
    success: true,
    email,
    temporaryPassword: "demo1234",
    demo: true,
  });
}
