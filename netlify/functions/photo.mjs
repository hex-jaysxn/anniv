import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const slot = url.searchParams.get("slot");

  if (!slot) {
    return new Response("Missing slot", { status: 400 });
  }

  const store = getStore("gallery-photos");
  const result = await store.getWithMetadata(`slot-${slot}`, { type: "arrayBuffer" });

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = result.metadata?.contentType || "image/jpeg";

  return new Response(result.data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=120, must-revalidate"
    }
  });
};

export const config = {
  path: "/api/photo"
};
