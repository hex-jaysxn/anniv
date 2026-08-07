import { getStore } from "@netlify/blobs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB safety limit

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { slot, dataUrl } = await req.json();

    if (!slot || !dataUrl) {
      return new Response(JSON.stringify({ error: "Missing slot or dataUrl" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
    if (!match) {
      return new Response(JSON.stringify({ error: "That doesn't look like a valid image" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");

    if (buffer.length > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "Image is too large (max 8MB)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("gallery-photos");
    await store.set(`slot-${slot}`, buffer, {
      metadata: { contentType, uploadedAt: new Date().toISOString() }
    });

    return new Response(JSON.stringify({ success: true, slot }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/upload"
};
