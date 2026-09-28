import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent the Groq SDK (server-only) from being bundled into the client.
  // Without this, the build may fail or expose server internals to the browser.
  serverExternalPackages: ["groq-sdk"],
};

export default nextConfig;
