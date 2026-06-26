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
export async function getTrackingMore(trackingNumber: string, carrierCode?: string): Promise<any | null> {
  try {
    // Step 1: Register with carrier code hint if available
    const body: Record<string, string> = { tracking_number: trackingNumber };
    if (carrierCode) body.courier_code = carrierCode;

    const createRes = await fetch(`${BASE_URL}/trackings/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const createJson = await createRes.json();
    console.log("[TrackingMore] create code:", createJson?.meta?.code, "carrier:", carrierCode ?? "auto");

    // Step 2: Wait then GET full tracking history
    await new Promise((r) => setTimeout(r, 1000));

    // Build GET URL
    let getUrl = `${BASE_URL}/trackings/get?tracking_numbers=${encodeURIComponent(trackingNumber)}&lang=en`;
    if (carrierCode) getUrl += `&courier_code=${encodeURIComponent(carrierCode)}`;

    const getRes = await fetch(getUrl, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });

    const getJson = await getRes.json();
    console.log("[TrackingMore] GET response:", JSON.stringify(getJson, null, 2));

    const item = getJson?.data?.items?.[0];
    return item ?? null;
  } catch (err) {
    console.error("[TrackingMore] error:", err);
    return null;
  }
}