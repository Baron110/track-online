import { NextRequest, NextResponse } from "next/server";
import { resolveTracking } from "@/lib/services/trackingService";
import { rateLimit } from "@/lib/utils/rateLimit";
import { TrackingApiResponse } from "@/lib/types/tracking";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function validateTrackingNumber(num: string): boolean {
  return /^[A-Za-z0-9\-_]{5,50}$/.test(num.trim());
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ trackingNumber: string }> }
) {
  const { trackingNumber } = await context.params;

  const ip = getClientIp(req);
  const { allowed, remaining } = rateLimit(ip);

  if (!allowed) {
    return NextResponse.json<TrackingApiResponse>(
      { success: false, error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  if (!trackingNumber || !validateTrackingNumber(trackingNumber)) {
    return NextResponse.json<TrackingApiResponse>(
      { success: false, error: "Invalid tracking number format.", code: "INVALID_INPUT" },
      { status: 400 }
    );
  }

  try {
    const result = await resolveTracking(trackingNumber);

    if (!result) {
      return NextResponse.json<TrackingApiResponse>(
        {
          success: false,
          error: "Tracking number not found. It may take up to 24 hours to appear after shipping.",
          code: "NOT_FOUND",
        },
        { status: 404, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    return NextResponse.json<TrackingApiResponse>(
      { success: true, data: result },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("[TRACK API ERROR]", err);
    return NextResponse.json<TrackingApiResponse>(
      { success: false, error: "Unable to retrieve tracking information. Please try again.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}