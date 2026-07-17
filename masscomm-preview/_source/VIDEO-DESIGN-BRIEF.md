# Hero Video — Design & Accessibility Brief

For the Mass Communications website redesign. Audience: the student producers (Mass Comm Club)
who shoot/edit the clips, and University Marketing & Communications (UMC) who host and embed them.

## 1. Where these videos go
A muted, looping **background hero video** sits at the top of each navigation page. Plan for up to
**7 clips**: Home + About, Degrees & Programs, For Students, News, Alumni & Friends,
Facilities & Services. (Start with Home + 2–3 and expand.) Each is ambient b-roll of students at
work — studio, field, editing bay, on-air, events — that fits the section.

## 2. Aspect ratio — deliver **16:9** (this is required; do not change it)
- **Master/delivery aspect ratio: 16:9** (e.g., 1920×1080 or 3840×2160). This matches the hero
  player container and is the universal web standard. **Do not deliver 4:3, 1:1, or vertical 9:16.**
- **Important:** the hero *displays* much wider and shorter than 16:9 — roughly **3:1 on desktop**
  (full-width band ≈ 46–60% of viewport height) — so the player **crops the top and bottom** of a
  16:9 frame to fill the band. This is expected "cover" behavior, not an error.
- **Therefore compose for a center safe-area (frame as if the visible band is ~21:9):**
  - Keep all essential subjects/action within the **central ~60% vertically** and **central ~80%
    horizontally**. Assume the outer edges will be cropped at some screen sizes (desktop crops top/
    bottom; narrow/mobile crops the sides).
  - On mobile the band is taller/narrower — keep the primary subject **horizontally centered**.
- If a more cinematic look with less cropping is ever wanted, a 2.39:1 / 21:9 master is acceptable,
  but **16:9 is the recommended and default deliverable** for compatibility. Flag any non-16:9
  master to UMC before delivery so the container can be matched.

## 3. Technical specs
| Spec | Requirement |
|---|---|
| Aspect ratio | **16:9** (see §2) |
| Resolution | 1920×1080 minimum; **3840×2160 (4K) preferred** |
| Frame rate | 24 or 30 fps (match your capture) |
| Duration | **20–60 s**, composed to **loop seamlessly** (first & last frames match; no hard cut/flash at the wrap) |
| Motion | Gentle, continuous motion; **no rapid cuts, strobing, or flashing** (see §4) |
| Audio | **None** — deliver with no audio track (the hero is always muted) |
| On-screen text/graphics | **None baked into the video** (it gets cropped and is not accessible — put words in the page text instead) |
| Format | **H.264 MP4** (primary); WebM/VP9 optional. If delivered via Vimeo/YuJa, they transcode — provide the highest-quality master |
| File weight | Keep web-friendly (short loop, efficient encode) or rely on Vimeo/YuJa streaming |
| Poster frame | **Required:** a strong still (JPG, 1920×1080, same framing) used as the load fallback and the reduced-motion image |

## 4. Accessibility requirements (WCAG 2.1 / 2.2 AA — required)
The hero is **decorative/ambient**, which keeps requirements light — *provided the rules below hold.*

1. **No essential information in the video alone.** Because it is muted, cropped, and hidden for
   reduced-motion users, anything it "says" must also exist in the page text. Keep clips purely
   atmospheric. *(1.1.1, 1.4.5)*
2. **Muted, no autoplay-with-sound.** No audio track. *(1.4.2)*
3. **User can pause it.** A visible, **keyboard-operable Pause/Play control** is built into the
   page (≥44×44px, labeled, `aria-pressed`). The hosting player must expose a **pause/play API**
   (Vimeo Player API and YuJa both do). *(2.2.2 Pause, Stop, Hide)*
4. **Respect reduced motion.** The page starts the video **paused** and shows the **poster image**
   when the visitor has "reduce motion" on — so a **poster still is a required deliverable** per clip. *(2.3.3)*
5. **No flashing.** Nothing that flashes more than **3 times per second**; avoid strobe, hard
   camera flashes, and abrupt high-contrast cuts. *(2.3.1)*
6. **Descriptive label.** Each embed carries a title identifying it as a background video (done in markup).

### If a clip is ever promoted to a *content* video (with sound / conveying meaning)
e.g., a featured story video placed in the page body, not the muted hero — then it additionally
**requires**, before publishing:
- **Captions** (synchronized `.vtt`) — *1.2.2*
- **A transcript** on the page — *1.2.1*
- **Audio description** (a described track or an audio-described version) — *1.2.5*
The chair has asked us to showcase accessibility; providing **captions + transcripts proactively**
on any sound-on video is the recommended way to do that.

## 5. Deliverables checklist (per clip)
- [ ] 16:9 master, 1080p or 4K, 24/30 fps
- [ ] 20–60 s, seamless loop, gentle motion, **no flashing**
- [ ] **No audio track**, **no baked-in text**
- [ ] Center-safe framing (subjects in the middle band)
- [ ] MP4 (H.264); WebM optional
- [ ] **Poster still** (JPG 1920×1080, matching framing)
- [ ] File named by section (e.g., `hero-about.mp4`, `hero-about-poster.jpg`)
- [ ] *(sound-on content videos only)* `.vtt` captions + transcript + audio description

## 6. Handoff notes for UMC (embedding)
- Host via **Vimeo** (background mode) or **YuJa** (the platform already used on Theatre & Dance),
  or self-host the MP4 in a `<video muted loop playsinline>` — all support the pause API our control needs.
- Set a **poster** on the player so the still shows before load and for reduced-motion.
- The container is 16:9-based with CSS "cover"; if a non-16:9 master is supplied, match the
  container aspect ratio.
- This mirrors the **Theatre & Dance** hero UMC already maintains — minimal new work.
