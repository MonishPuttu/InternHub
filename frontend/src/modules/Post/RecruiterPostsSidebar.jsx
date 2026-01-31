"use client";

import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import IconRail from "@/components/IconRail";
import { useRecruiterPostsUI } from "@/modules/Post/RecruiterPostsUIContext";

export default function RecruiterPostsSidebar() {
  const postsUI = useRecruiterPostsUI();

  if (!postsUI) return null;

  const { activeTab, setActiveTab, counts } = postsUI;

  const items = [
    {
      key: "pending",
      icon: <HourglassEmptyIcon />,
      label: `Pending (${counts.pending})`,
      active: activeTab === 0,
      onClick: () => setActiveTab(0),
    },
    {
      key: "approved",
      icon: <CheckCircleIcon />,
      label: `Approved (${counts.approved})`,
      active: activeTab === 1,
      onClick: () => setActiveTab(1),
    },
    {
      key: "disapproved",
      icon: <CancelIcon />,
      label: `Disapproved (${counts.disapproved})`,
      active: activeTab === 2,
      onClick: () => setActiveTab(2),
    },
  ];

  return <IconRail items={items} />;
}
