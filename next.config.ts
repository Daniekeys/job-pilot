import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (and its CanvasFactory dependency, @napi-rs/canvas) ship native
  // per-platform binaries that Turbopack's bundler can't statically resolve —
  // externalizing them makes Node require() the real files at runtime instead.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

export default nextConfig;
