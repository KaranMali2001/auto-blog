import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
    console.log("Webhook payload:", evt.data);

    return NextResponse.json("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json("Error verifying webhook", { status: 400 });
  }
}
