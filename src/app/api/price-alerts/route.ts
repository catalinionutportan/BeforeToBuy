import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const alertSchema = z.object({
  email: z.string().email(),
  productId: z.string().min(1),
  countryCode: z.string().min(2),
  targetPrice: z.number().min(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = alertSchema.parse(body);

    const alert = await prisma.priceAlert.create({
      data: {
        email: data.email,
        productId: data.productId,
        countryCode: data.countryCode,
        targetPrice: data.targetPrice,
        currency: "RON", 
        locale: "ro",
      },
    });

    return NextResponse.json({ success: true, alertId: alert.id });
  } catch (error) {
    console.error("Failed to create price alert:", error);
    return NextResponse.json(
      { error: "Date invalide sau eroare server" },
      { status: 400 }
    );
  }
}
