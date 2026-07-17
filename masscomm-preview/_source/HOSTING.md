# Hosting the concept on aura-lab.siue.edu

## ✅ DEPLOYED (2026-07-16) — live now
- **Concept preview (7 pages):** https://aura-lab.siue.edu/masscomm-preview/index.html
- **Stylesheet for Cascade bodies:** https://aura-lab.siue.edu/mc-body.css
- Pushed to host `apleith-dev`, docroot `/opt/the-cage/aura-lab/current/` (additive — a new
  `masscomm-preview/` subfolder + `mc-body.css`; no AURA files touched). Unlinked: share by direct URL.

> **One caveat — ephemeral vs. AURA redeploys.** These files live *inside* the AURA docroot, which
> the AURA deploy manages with `rsync --delete`. **A full AURA Lab site redeploy will remove them.**
> If that happens, re-run the push (from `C:\pythia\work\masscomm-redesign`, Git Bash):
> ```
> tar czf - index.html about.html degrees-programs.html for-students.html news.html alumni-friends.html facilities-services.html assets/mc.css assets/mc.js \
>   | ssh apleith-dev 'mkdir -p /opt/the-cage/aura-lab/current/masscomm-preview && tar xzf - -C /opt/the-cage/aura-lab/current/masscomm-preview'
> scp body-copy/mc-body.css apleith-dev:/opt/the-cage/aura-lab/current/mc-body.css
> ```

---

Two separate things can be hosted on a domain we control (`aura-lab.siue.edu`):

1. **The concept preview site** — the 7 working pages, as **unlinked** pages, so we can show intent
   to the department and to University Marketing & Communications (UMC).
2. **`mc-body.css`** — the stylesheet the Cascade body copy `@import`s (needed only when we start
   pasting the Tier-1 body content into Cascade).

> The push is already done (see the DEPLOYED box above). The section below documents *what* was
> uploaded and where, for reference / re-deploys.

---

## 1. Concept preview site (unlinked)

**Upload this folder** to a subdirectory, e.g. `aura-lab.siue.edu/masscomm-preview/`:
```
index.html
about.html
degrees-programs.html
for-students.html
news.html
alumni-friends.html
facilities-services.html
assets/mc.css
assets/mc.js
```
(Optionally include the `.md` docs and `body-copy/` for reference — not required for the preview.)

**Entry point:** `https://aura-lab.siue.edu/masscomm-preview/index.html`. The red department nav bar
links the pages to each other with **relative** paths, so navigation works as long as the folder is
uploaded intact.

**Nothing else needs changing** — the SIUE chrome (header/footer), Vimeo hero, and Google Fonts all
load over `https://`, and the mockup banner stays (it usefully signals "concept, not live").

**"Unlinked"** = do not add it to the aura-lab site navigation; just share the direct URL. Anyone
with the link can view it; it won't be discoverable from the AURA Lab site.

---

## 2. `mc-body.css` (for the Cascade body copy)

Each `*-body-BEST.html` starts with:
```html
<style>@import url("https://aura-lab.siue.edu/mc-body.css");</style>
```
So place **`mc-body.css` at exactly** `https://aura-lab.siue.edu/mc-body.css` (site root).

If you'd rather keep it in the preview subfolder (e.g. `…/masscomm-preview/mc-body.css`), that's fine
— just update the one `@import` line in each `*-body-BEST.html` to match the URL. (Only if UMC ends
up hosting the stylesheet site-wide do you delete the `@import` line entirely.)

---

## Why hosting helps
- **Department:** a real, clickable concept beats a description — easy to review and agree on before
  we commit to the UMC ask.
- **UMC:** the preview *is* the reference implementation. Paired with `UMC-REDESIGN-PACKET.md`, it
  shows exactly what "parity with Theatre & Dance" means for us and links to the code they'd lift.
- **Body testing:** once `mc-body.css` is live at the URL above, the `*-body-BEST.html` files render
  identically whether previewed on aura-lab or pasted into Cascade — so we can validate before UMC
  even replies.
