import { NextResponse } from "next/server";

export async function GET(){
  return new NextResponse("Assignment endpoint", { status: 200 }); 
}
