"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../modules/sidebar";

const DRAWER_WIDTH = 240;

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) router.push("/signin");

    const m = window.matchMedia("(min-width: 900px)");
    const handle = (ev) => setIsDesktop(ev.matches);
    setIsDesktop(m.matches);
    m.addEventListener
      ? m.addEventListener("change", handle)
      : m.addListener(handle);
    return () => {
      m.removeEventListener
        ? m.removeEventListener("change", handle)
        : m.removeListener(handle);
    };
  }, [router]);

  if (!mounted) return null;

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", background: "transparent" }}
    >
      {/* Sidebar container — in-flow on desktop so no extra margin calc is required */}
      <div style={{ width: isDesktop ? DRAWER_WIDTH : "auto", flexShrink: 0 }}>
        <Sidebar
          variant={isDesktop ? "permanent" : "temporary"}
          open={!isDesktop && mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content area (no margin-left) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 12,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "transparent",
            zIndex: 1200,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              display: isDesktop ? "none" : "inline-flex",
              background: "#6d28d9",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              zIndex: 1300,
            }}
            aria-label="open menu"
          >
            Menu
          </button>

          <div style={{ fontWeight: 700, color: "#e2e8f0" }}>InternHub</div>

          <div style={{ width: 56 }} />
        </div>

        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
