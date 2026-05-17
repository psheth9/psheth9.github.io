
## Pages

- `/` — Homepage. Operator's Card layout: profile, career strip, shipped stats, featured project, full experience, recommendations.
- `/blog/` — Tech writing. Each post is a Markdown file in `_posts/`.
- `/notes/` — Personal notes. Algorithms + system design. Each note is a Markdown file in `_notes/`. Tag filter in the UI.

## File map

```
.
├── CNAME                         # custom domain: pritsheth.com
├── _config.yml                   # Jekyll config
├── Gemfile                       # Ruby deps (github-pages gem)
├── index.html                    # homepage
├── blog.html                     # blog index
├── notes.html                    # notes index
├── 404.html
├── _layouts/                     # page templates
│   ├── default.html
│   ├── post.html
│   └── note.html
├── _includes/                    # partials
│   ├── head.html
│   ├── header.html
│   ├── footer.html
│   └── tape.html
├── _posts/                       # blog posts (YYYY-MM-DD-slug.md)
├── _notes/                       # algorithm + system-design notes
└── assets/
    ├── css/style.scss            # all site styles (light + dark)
    └── js/theme.js               # theme toggle
```

---

## Deploy to GitHub Pages

### 1. Create the repo

Two options:

- **Easiest** — Name the repo exactly `pritsheth.github.io` (replace with your actual GitHub username). GitHub serves it as a user page automatically.
- **Project page** — Any name (e.g. `personal-site`). You'll need to enable Pages manually in repo settings.

### 2. Push this folder to GitHub

```bash
cd pritsheth.com
git init
git add .
git commit -m "initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 3. Enable GitHub Pages

GitHub → repo → **Settings** → **Pages**:

- Source: **Deploy from a branch**
- Branch: `main` · folder: `/ (root)`
- Save

Wait ~60 seconds. Your site will be live at `https://<username>.github.io` (user page) or `https://<username>.github.io/<repo-name>/` (project page).

### 4. Point pritsheth.com at GitHub Pages

At your DNS provider (Namecheap, Cloudflare, Google Domains, etc.), add these records for `pritsheth.com`:

| Type  | Name | Value                          |
|-------|------|--------------------------------|
| A     | @    | `185.199.108.153`              |
| A     | @    | `185.199.109.153`              |
| A     | @    | `185.199.110.153`              |
| A     | @    | `185.199.111.153`              |
| CNAME | www  | `<your-username>.github.io.`   |

> Don't forget the trailing dot on the CNAME value if your DNS provider requires it.

DNS can take 5 minutes to 24 hours to propagate.

### 5. Confirm in GitHub

Back at **Settings → Pages**, in the "Custom domain" field enter `pritsheth.com` → Save. GitHub will verify DNS and issue a free Let's Encrypt cert. Check **Enforce HTTPS** once the cert is ready.

You're live.

---

## Adding content

### A new blog post

Create `_posts/YYYY-MM-DD-your-slug.md`:

```markdown
---
title: "Your post title"
date: 2026-05-14
tags: [tag1, tag2]
excerpt: "One-sentence summary shown on the blog index."
---

Post body in Markdown.
```

Commit + push. GitHub Pages rebuilds automatically.

### A new algorithm note

Create `_notes/your-slug.md`:

```markdown
---
title: "Two-pointer technique for sorted arrays"
date: 2026-05-14
category: algo            # or: system-design
difficulty: easy          # easy | medium | hard
summary: "Short summary line for the notes index."
problem: "(Optional) Problem statement — renders as a blockquote at the top."
---

Note body in Markdown. Use code blocks, images, lists — whatever you need.
```

### A new system design note

Same as above, with `category: system-design`. Skip `difficulty`.

### Add your photo

Drop a square photo at `assets/img/prit.jpg`. The site already references that path — the `<img>` tag is wired with a `PS`-initials fallback, so the photo appears automatically when the file exists.

If you want to use PNG or WebP instead, save it as `prit.png` (or `.webp`) and update the `src` in `index.html` from `prit.jpg` to your filename.

### Swap in official company logos

The site ships with hand-crafted SVG approximations for each company at `assets/img/logos/`. If you want the real, official versions, swap them in — no code change needed, just keep the same filenames.

| File             | Where to grab the official SVG                                                                                |
|------------------|---------------------------------------------------------------------------------------------------------------|
| `meta.svg`       | <https://commons.wikimedia.org/wiki/File:Meta_Platforms_logo.svg>                                             |
| `dropbox.svg`    | <https://commons.wikimedia.org/wiki/File:Dropbox_logo_2017.svg>                                               |
| `robinhood.svg`  | <https://commons.wikimedia.org/wiki/File:Robinhood_(company)_logo.svg>                                        |
| `stellar.svg`    | <https://commons.wikimedia.org/wiki/Category:Stellar_(payment_network)>                                       |
| `quantstamp.svg` | <https://quantstamp.com/> (right-click → save logo)                                                           |
| `barclays.svg`   | <https://commons.wikimedia.org/wiki/File:Barclays_logo.svg>                                                   |

Steps:

1. Open the Wikimedia page, click the SVG, then **right-click → Save As** the actual SVG file.
2. Rename it to match the table above (e.g. `meta.svg`).
3. Drop it into `assets/img/logos/`, overwriting my version.
4. Done. The homepage uses whatever's at that path.

> Tip: if the official logo is a full wordmark (logo + company name side by side) and looks cramped inside the tile, just crop the SVG to the icon-only portion — keep `viewBox` tight to the glyph.

### Add your CV

Save your CV as `assets/prit-sheth-cv.pdf`. The "download cv" link on the homepage will pick it up automatically.

### Add a recommendation

Open `index.html`, find the "What people I've worked with say" section. Each rec is a `<figure class="rec">` block — duplicate one and paste in the quote + attribution. Remove `rec__placeholder` from the class list to lose the dashed border.

---


### Important — this is a SOFT gate

The note HTML is still served to the browser; it's just hidden via CSS until the password matches. Someone who opens DevTools and disables JS, or who brute-forces a weak password against the hash, can read the content. Treat this as "keeps casual visitors and search engines out" — not as encryption.

If you want real encryption (note bodies stored as AES ciphertext, password-derived key decrypts them at runtime), use [StatiCrypt](https://github.com/robinmoisson/staticrypt) as a build step. Ask and I'll wire it in.

---

## Run locally (optional)

```bash
# install Ruby + bundler if you don't have them
bundle install
bundle exec jekyll serve --livereload
```

Visit `http://localhost:4000`. Edits to `.md`, `.html`, `.scss` files trigger live reload.

---

## Keyboard shortcuts

- `t` — toggle dark / light mode

---

## Customizing the "LIVE" status bar

The top black tape that says "NOW: Building Dynamic Ads at Meta · San Francisco · open to chat" is in `_includes/tape.html`. Update the text whenever your "now" changes.

---

## License

Site content (resume text, blog posts, notes) © Psh

Site code (layouts, CSS) — feel free to copy and adapt.
