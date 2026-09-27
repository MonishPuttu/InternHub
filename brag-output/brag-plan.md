# /brag plan — InternHub

**What it is:** A campus placements & internship management platform connecting students, recruiters and the college placement cell.
**Who it's for:** Students hunting internships, recruiters hiring from campus, and placement officers running the process.
**What sets it apart:** One pipeline for all three roles — a student's application moves from Applied → Interview Scheduled → Interviewed → Offer, and everyone sees it.
**Most impressive claim:** The whole placement lifecycle, from job post approval to offer letter, in one place.
**Visual hook:** A single application card whose status climbs from "Applied" to "Offer Approved".
**Tone:** polished — clean, confident, product-launch.
**Share caption:** "From Apply to Offer — one hub."

## Visual identity (from the code)
- MUI theme from `frontend/src/lib/themeRegistry.jsx`: primary `#8b5cf6`, background `#f1f5f9`, text `#0f172a` / `#64748b`, success `#10b981`
- Font: the app uses the system stack (`-apple-system, Segoe UI, Roboto`); Inter is used in the video as the closest available match
- Status names from `formatStatus` in `frontend/src/modules/Dashboard/Student.jsx` (Applied, Interview Scheduled, Interviewed, Offer Pending, Offer Approved)
- Screens + data (Sneha Patel ECE23-058, Adobe PM Intern ₹17.58 LPA, Deloitte Business Analyst ₹34.22 LPA, Post Management 7/18/30) rebuilt from the real screenshots in `frontend/public/S*.png`, `R*.png`, `P*.png`

## Storyboard (21s, 1920×1080 @ 30fps)
| # | Time | Scene | On screen |
|---|------|-------|-----------|
| 1 | 0.0–3.3 | **Hook** | "From Apply to Offer." — Sneha Patel's status climbs Applied → Interview Scheduled → Interviewed → Offer Approved |
| 2 | 3.3–6.5 | **Reveal** | InternHub + "Campus placements & internships — for students, recruiters and the placement cell." |
| 3 | 6.5–10.3 | **Students** | Available Opportunities; Apply Now → ✓ Applied, Applied Posts 3 → 4 |
| 4 | 10.3–14.5 | **Recruiters** | Applications for Adobe — PM Intern; Manage → Send Offer Letter (17.58 LPA) → Offer Pending |
| 5 | 14.5–18.3 | **Placement cell** | Post Management; approve Infosys Business Analyst post, counters update |
| 6 | 18.3–21.0 | **Outro** | "Every placement. One hub." + 1intern-hub.vercel.app |

## Sound
E major, 96 bpm, restrained pad and pluck; status-step pops rising in pitch, chime on "Offer Approved", impact on the reveal, clicks + soft chimes on each action.
