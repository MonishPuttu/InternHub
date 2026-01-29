"use client";

import { usePathname } from "next/navigation";
import PlacementPostsSidebar from "@/modules/Post/PlacementPostsSidebar";

export default function GlobalSidebar() {
  const pathname = usePathname();

  // MUST be lowercase
  if (pathname?.startsWith("/post")) {
    return <PlacementPostsSidebar />;
  }

  return null;
}
