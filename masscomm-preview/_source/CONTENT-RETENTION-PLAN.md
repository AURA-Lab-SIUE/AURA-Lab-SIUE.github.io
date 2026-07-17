# Mass Communications redesign — Content Retention Plan

**Purpose:** show exactly where every piece of the *current* SIUE Mass Communications site
lands in the redesigned (no-sidebar) information architecture, so nothing is lost in the rebuild.

**Rule of the redesign:** the department's left **sidebar navigation is removed**. Its role is
replaced by (1) the persistent **7-item red department bar** (top-level sections) and (2) a
sticky **"In this section"** bar on each interior page that carries that section's former
sidebar links. Deep pages (individual faculty profiles, each facility page, news articles) are
**not rebuilt** — they remain live on siue.edu and the redesigned landing pages link to them.

---

## 1. Top-level information architecture (the 7 "landing" pages)

| # | Landing page | File | Hero |
|---|---|---|---|
| 1 | Home | `index.html` | Ambient **video** (muted, pausable) |
| 2 | About | `about.html` | Ambient video (muted, pausable) |
| 3 | Degrees & Programs | `degrees-programs.html` | Ambient video (muted, pausable) |
| 4 | For Students | `for-students.html` | Ambient video (muted, pausable) |
| 5 | News | `news.html` | Ambient video (muted, pausable) |
| 6 | Alumni & Friends | `alumni-friends.html` | Ambient video (muted, pausable) |
| 7 | Facilities & Services | `facilities-services.html` | Ambient video (muted, pausable) |

Every nav page has its own hero video (muted, looping, with a keyboard pause control). In
production each of the 7 pages gets one unique clip; the mockup reuses 3 placeholder clips.
Interior heroes are slightly shorter than Home but tall enough to avoid awkward cropping.

---

## 2. Per-section retention map

### 2.1 Home (`index.html`)
- **Welcome / ACEJMC accreditation statement** → kept, reset as the editorial mission statement.
- **Three professional options** (Journalism · Media Production · Advertising & Strategic Media) → kept as the "Three ways to work in media" cards.
- **Six section link cards** → kept as the "department at a glance" directory grid.
- **Give Today** link → kept (buttons + CTA band).

### 2.2 About (`about.html`)
Former sidebar → **In this section** bar: Overview · Faculty & Staff · ACEJMC Accreditation · Research & Creative Work · Diversity Statement.
- Mission, Vision → kept verbatim.
- "By the numbers" stat row (faculty / tracks / scholarships / ACEJMC) → kept.
- Department overview + graduate-employer list → kept.
- "Explore the department" cards (Programs & Tracks, Faculty & Staff, Facilities) → kept.
- Contact block (Dunham Hall 1031, phone, chair) → kept.
- **Deep pages preserved via links:** faculty-staff, acejmc-accreditation, research-creative-work, diversity-statement, individual faculty profiles (`about/<name>.shtml`).

### 2.3 Degrees & Programs (`degrees-programs.html`)
Former sidebar → **In this section** bar: Programs · Professional Tracks · Laptop Recommendations.
- Programs intro (ACEJMC, re-accredited 2024 / next review 2030) → kept.
- Undergraduate program + 3 track cards (with careers) → kept.
- Accelerated Combined BA/BS + MS callout → kept.
- Graduate program: two concentrations, certificate, **program-structure table**, assistantships, embedded YouTube interview → kept.
- Minor in Mass Communications → kept.
- Film & TV Workforce Training Program → kept (also appears on For Students).
- **Degree Program Listing (Majors & Programs / Certificates / Minors)** — the sitewide SIUE DPL widget → **preserved**. Rendered here as a static styled replica; in Cascade the live dynamic widget markup stays.

### 2.4 For Students (`for-students.html`)
Former sidebar → **In this section** bar: Overview · Events · Scholarships/Awards · Internship FAQ · Sample Templates.
- Quick links (Scholarships, Internship FAQ, Careers Dashboard, Sample Templates, Laptop Recs) → kept as cards.
- Advising + **faculty mentors-by-area table** + DegreeWorks/requirements links → kept.
- Student media & organizations (The Alestle, Global Village, Web Radio, WSIE 88.7, MC Club) → kept as cards.
- Study Abroad → kept.
- Film & TV Workforce Training Program → kept.

### 2.5 News (`news.html`)
- No sub-pages (no "In this section" bar).
- **Dynamic news feed** → preserved. Rendered here as a static styled listing of the 4 current stories (Mass Comm Week 2026, Film & TV Workforce launch, Mass Comm Week 2025 recap, Oliver Brammeier commencement), each linking to the live article. In Cascade the automatic feed block stays; a link to the full College of Arts & Sciences news archive is included.

### 2.6 Alumni & Friends (`alumni-friends.html`)
- No sub-pages → **In this section** bar used as an **in-page anchor nav** (Giving · Spotlight · Events · Support · Stay Connected).
- Alumni & Giving intro, Alumni Spotlight (call for stories), Alumni Events (Alumni Night / Mass Comm Week, social links) → kept.
- Support: Technology Investment ($500K since 2018 + PDF), **named scholarship-funds table** (Give links) → kept.
- Stay Connected / contact block → kept.

### 2.7 Facilities & Services (`facilities-services.html`)
Former sidebar → **In this section** bar: Facilities · Television Studio · Video Editing Lab · Field Cameras · Multimedia Lab · Audio Lab · Video Services · Production Engineers.
- Intro + six facility cards (TV Studio, Video Editing Lab, Audio Lab, Multimedia Lab, Field Cameras & Equipment, Video Services) → kept, each linking to its live sub-page.
- Production Engineers (Ben Moyer, Theresa Pauli) → kept.

---

## 3. Assets
- **Images:** all content photos referenced are the department's real assets under
  `…/mass-communications/img/` (verified live, HTTP 200). SIUE chrome images were switched from
  protocol-relative (`//siue.edu/…`) to `https://` so they load under `file://` too.
- **Hero videos:** 3 placeholder Vimeo clips from a broadcasting instructor
  (MC 435 Fall 25 · GV BTS Sp 26 · Harvest Moon BTS). Production plan: the Mass Comm Club
  produces polished 20–60s clips (Home + optionally one per section).

---

## 4. Content discrepancies to reconcile in the CMS (surfaced, not silently changed)

These inconsistencies exist in the **current live content** and were preserved as-is. Please
reconcile the source of truth before publishing:

1. **Full-time faculty count** — About stat row says **13**; an About card elsewhere says **11**.
2. **Scholarship count** — For Students says **18** scholarships/funds; Alumni & Friends says **27**.
3. **Facility investment** — Alumni says **"over $500,000 since 2018"**; Facilities says **"over $800,000 since 2025"**.
4. **Author to-do notes** — the live For Students page contains HTML comments ("NOTES FOR ALEX", "ASK CHAIR…"); these were excluded from the mockup but remain in the CMS source.

---

## 5. Not rebuilt (intentionally kept live on siue.edu)
Individual faculty/staff profile pages, each facility detail page, each news article, the
Scholarships/Awards, Events, Internship FAQ, Sample Templates, ACEJMC, Research, and Diversity
pages. The redesigned landing pages link out to all of them, so they stay reachable without a sidebar.
