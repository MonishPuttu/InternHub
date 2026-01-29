"use client";

import { usePathname } from "next/navigation";
import PlacementPostsSidebar from "@/modules/Post/PlacementPostsSidebar";
// future imports:
// import DashboardSidebar from "@/modules/Dashboard/DashboardSidebar";

export default function GlobalSidebar() {
  const pathname = usePathname();

  // POSTS
  if (pathname && pathname.startsWith("/Post")) {
    return <PlacementPostsSidebar />;
  }

  return null;
}
