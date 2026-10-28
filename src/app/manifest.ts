import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/config";

// Lets people add Zega to their phone's home screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME}: Citizenship test prep`,
    short_name: APP_NAME,
    start_url: "/study",
    display: "standalone",
    background_color: "#F5F7FA",
    theme_color: "#1D3A6B",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
