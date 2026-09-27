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

## Voice-over version (42s)
The final `brag.mp4` is the extended cut with narration. Voice: Kokoro TTS (`af_heart`), generated locally. Each scene's timeline was stretched to fit its line (entrances and transitions keep their original speed; only the hold in the middle of each scene slows down), the soundtrack was re-timed to match, and the music ducks under the voice. Some spellings below are written for the voice, e.g. "Ani-Talk", "R-x Check".

| # | Time | Narration |
|---|------|-----------|
| 1 | 0.0–3.3s | From apply, to offer. |
| 2 | 3.3–10.7s | Intern Hub brings campus placements into one platform, for students, recruiters, and the college placement cell. |
| 3 | 10.7–19.3s | Students browse approved opportunities, save the ones they like, apply in a single click, and track the status of every application. |
| 4 | 19.3–28.2s | Recruiters review applicants with their branch and CGPA, manage the shortlist, and send offer letters, without a single spreadsheet. |
| 5 | 28.2–35.5s | And the placement cell approves job posts, tracks every student, and sees placement analytics in one dashboard. |
| 6 | 35.5–41.6s | Intern Hub. Every placement, one hub. Try the live demo today. |
