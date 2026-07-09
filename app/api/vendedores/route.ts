import { NextResponse } from "next/server";

const vendedoresDemo = [
  {
    id: "vendedor-admin",
    nome: "Daniel Lima",
    telefone: "(11) 97720-6591",
    email: "admin@admin.com",
    user_id: "user-admin-demo",
  },
  {
    id: "vendedor-julia",
    nome: "Julia Martins",
    telefone: "(11) 95555-0101",
    email: "julia@demo.com",
    user_id: "user-julia-demo",
  },
];

export async function GET() {
  return NextResponse.json(vendedoresDemo);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ id: `vendedor-${Date.now()}`, ...body });
}

export async function PUT(request: Request) {
  return NextResponse.json(await request.json());
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
