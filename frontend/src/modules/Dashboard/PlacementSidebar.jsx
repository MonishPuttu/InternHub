"use client";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter, usePathname } from "next/navigation";

import IconRail from "@/components/IconRail";
import { usePlacementUI } from "@/modules/Dashboard/PlacementUIContext";

export default function PlacementSidebar() {
  const placementUI = usePlacementUI();
  const router = useRouter();
  const pathname = usePathname();

  if (!placementUI) return null;

  const { tab, setTab } = placementUI;

  const makeHandler = (t) => () => {
    setTab(t);
    try {
      const base = pathname?.split("?")[0] ?? "/";
      router.push(`${base}?tab=${t}`);
    } catch (e) {
      // ignore
    }
  };

  const items = [
    { key: "recent", icon: <NoteAddIcon />, label: "Recently Created", active: tab === "recent", onClick: makeHandler("recent") },
    { key: "ongoing", icon: <PlayCircleOutlineIcon />, label: "Ongoing", active: tab === "ongoing", onClick: makeHandler("ongoing") },
    { key: "completed", icon: <CheckCircleIcon />, label: "Completed", active: tab === "completed", onClick: makeHandler("completed") },
  ];

  return <IconRail items={items} />;
}
