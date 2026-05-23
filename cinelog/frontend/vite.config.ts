// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

const isVercel = !!process.env.VERCEL;

export default defineConfig({
  // Cloudflare worker build locally; Nitro + Vercel preset when deploying to Vercel.
  cloudflare: isVercel ? false : undefined,
  tanstackStart: isVercel
    ? {}
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts (SSR error wrapper).
        server: { entry: "server" },
      },
  plugins: isVercel ? [nitro({ preset: "vercel" })] : [],
});
