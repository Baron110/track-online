const BASE_URL = "https://api.trackingmore.com/v4";

function getHeaders() {
  const key = process.env.TRACKINGMORE_API_KEY;
  if (!key) throw new Error("TRACKINGMORE_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    "Tracking-Api-Key": key,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTrackingMore(trackingNumber: string): Promise<any | null> {
  try {
    // V4: POST to create = create & get in one call (real-time)
    const res = await fetch(`${BASE_URL}/trackings/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tracking_number: trackingNumber }),
      cache: "no-store",
    });

    const json = await res.json();
    console.log("[TrackingMore] response:", JSON.stringify(json, null, 2));

    // If already exists, fetch it
    if (json?.meta?.code === 4013) {
      return await fetchExisting(trackingNumber);
    }

    if (!res.ok || !json?.data) return null;
    return json.data;
  } catch (err) {
    console.error("[TrackingMore] error:", err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchExisting(trackingNumber: string): Promise<any | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/trackings/get?tracking_numbers=${encodeURIComponent(trackingNumber)}`,
      { method: "GET", headers: getHeaders(), cache: "no-store" }
    );
    const json = await res.json();
    return json?.data?.items?.[0] ?? null;
  } catch {
    return null;
  }
}