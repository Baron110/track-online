const BASE_URL = "https://api.17track.net/track/v2.2";

function getHeaders() {
  const key = process.env.TRACK17_API_KEY;
  if (!key) throw new Error("TRACK17_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    "17token": key,
  };
}

export async function registerTracking(trackingNumber: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify([{ number: trackingNumber }]),
    });
  } catch (err) {
    console.error("[17TRACK] Register error:", err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTracking(trackingNumber: string): Promise<any | null> {
  const res = await fetch(`${BASE_URL}/gettrackinfo`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify([{ number: trackingNumber }]),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[17TRACK] gettrackinfo failed:", res.status);
    return null;
  }

  const json = await res.json();
  console.log("[17TRACK] raw response:", JSON.stringify(json, null, 2));

  // v2.2 structure: data.accepted[0]
  const item = json?.data?.accepted?.[0];
  if (!item) return null;

  // Return the full item so service can access track_info
  return item;
}