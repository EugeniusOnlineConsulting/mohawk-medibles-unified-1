/**
 * QR Code API — Generate QR codes for orders and products
 * GET /api/qrcode?type=order&value=MM-12345
 * GET /api/qrcode?type=product&value=SKU-123
 */
import { NextRequest, NextResponse } from "next/server";
import { generateOrderQR, generateProductQR } from "@/lib/qrcode";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const value = searchParams.get("value");

  if (!type || !value) {
    return NextResponse.json(
      { error: "Missing type or value parameter" },
      { status: 400 }
    );
  }

  try {
    let dataUrl: string;

    if (type === "order") {
      dataUrl = await generateOrderQR(value);
    } else if (type === "product") {
      dataUrl = await generateProductQR(value);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'order' or 'product'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ qrCode: dataUrl });
  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
