import { NextResponse } from "next/server";

export async function GET(){
  return new NextResponse("Working well", { status: 200 }); 
}
