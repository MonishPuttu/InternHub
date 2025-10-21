"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isRecruiter } from "@/lib/roleProtection";
import PostOpportunities from "@/modules/PostOpportunities";

export default function PostRecruiterPage() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Check if user is recruiter
    if (!isRecruiter()) {
      console.warn("Unauthorized: Only recruiters can create posts");
      router.push("/signin");
    }
  }, [router]);

  return <PostOpportunities />;
}