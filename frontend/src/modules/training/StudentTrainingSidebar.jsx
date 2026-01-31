"use client";

import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuizIcon from "@mui/icons-material/Quiz";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useRouter, usePathname } from "next/navigation";

import IconRail from "@/components/IconRail";
import { useStudentTrainingUI } from "@/modules/training/StudentTrainingUIContext";

export default function StudentTrainingSidebar() {
  const ui = useStudentTrainingUI();
  const router = useRouter();
  const pathname = usePathname();

  if (!ui) return null;

  const { tab, setTab, counts } = ui;

  const makeHandler = (t) => () => {
    setTab(t);
    try {
      const base = pathname?.split("?")[0] ?? "/training/student";
      router.push(`${base}?tab=${t}`);
    } catch (e) {
      // ignore
    }
  };

  const items = [
    {
      key: "new",
      icon: <NoteAddIcon />,
      label: `Recently Posted (${counts.new})`,
      active: tab === "new",
      onClick: makeHandler("new"),
    },
    {
      key: "ongoing",
      icon: <PlayCircleOutlineIcon />,
      label: `Ongoing (${counts.ongoing})`,
      active: tab === "ongoing",
      onClick: makeHandler("ongoing"),
    },
    {
      key: "completed",
      icon: <CheckCircleIcon />,
      label: `Completed (${counts.completed})`,
      active: tab === "completed",
      onClick: makeHandler("completed"),
    },
    {
      key: "additional",
      icon: <QuizIcon />,
      label: "Additional Tests",
      active: tab === "additional",
      onClick: makeHandler("additional"),
    },
    {
      key: "reportcard",
      icon: <AssessmentIcon />,
      label: "Report Card",
      active: tab === "reportcard",
      onClick: makeHandler("reportcard"),
    },
  ];

  return <IconRail items={items} />;
}
