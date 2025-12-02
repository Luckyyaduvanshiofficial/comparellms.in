# comparellms — Copilot context & instructions

> Purpose: a clear, production-minded context file Copilot can use to generate and maintain a static, multi-page HTML website hosted on GitHub Pages (`comparellms.in`). The site is a daily comparison blog for LLMs and other AI models. It must be efficient and reliable even with hundreds of posts, and include standard pages (About, AI Content Use Policy, Contact, 404), a dynamic blog-grid (newest posts on top), and automation to regenerate `sitemap.xml`, `posts-index` JSON, and RSS when content changes.

---

## 1) High-level goals (short)

- Static site (HTML / CSS / JavaScript) hosted on GitHub Pages.
- Each article is a standalone HTML page (folder per post) so each post has its own URL.
- A dynamic **Blog Grid** page fetches a small index file (`posts-index.json`) and renders posts with newest first. Grid must keep newest posts at the top automatically.
- A Python script (`scripts/generate_index_and_sitemap.py`) scans posts, extracts metadata, and regenerates:
  - `posts-index.json` (paginated if needed)
  - `sitemap.xml`
  - `rss.xml`
- GitHub Action to run the generator on each push (optionally only on `main`), and commit the outputs back to the repo if they changed.
- Provide an AI Content Use Policy page template for safety and transparency.
- Keep UX and SEO best-practices (meta tags, JSON-LD schema.org Article, OpenGraph, canonical links, robots.txt).

---

## 2) Tech stack & constraints

- **Frontend:** Vanilla HTML/CSS/JS (no build step; plain files). Use modern ES modules if needed.
- **Hosting:** GitHub Pages (no server runtime). Automation via GitHub Actions.
- **Scripts:** Python 3.10+ for local automation and CI script. Use only standard library (so Action can run without extra deps), but make it easy to drop in `requirements.txt` if needed.
- **Performance:** Optimize for 500+ posts: index sharding/pagination, small JSON payloads, lazy-loaded images.
- **Accessibility:** semantic HTML, alt text, keyboard focus, aria labels where appropriate.

---

## 3) Repo layout (recommended)

```
/ (root)
  index.html                 # Home (hero + latest posts grid)
  about.html
  ai-content-policy.html
  contact.html               # simple form via formspree / static contact or mailto
  404.html
  blog/                      # blog list page (static page that uses JS to render grid)
    index.html
  posts/                     # each post: posts/YYYY-MM-DD-slug/index.html
    2025-12-01-gpt-vs-xyz/index.html
    2025-11-30-llm-compare/index.html
  assets/
    css/ main.css
    js/  blog-grid.js, utils.js
    img/ (thumbnails, logos)
  scripts/
    generate_index_and_sitemap.py
  .github/
    workflows/ci.yml         # runs the script and optionally commits outputs
  posts-index.json           # top-level index (paginated splits like posts-index-page-1.json)
  sitemap.xml
  rss.xml
  robots.txt
  README.md
```

**Naming convention for posts:** `YYYY-MM-DD-slug` (dash-separated). The post URL will be `/posts/YYYY-MM-DD-slug/` and the file will be `index.html` inside that folder. This keeps chronological ordering and easy sorting.

---

## 4) Post HTML template (required fields and example)

Each post `index.html` should contain the following meta fields (in `<head>`):

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <title>GPT-X vs Gemini — Quick Comparison | comparellms.in</title>
  <meta name="description" content="Short 155 char summary of the comparison post.">
  <meta name="author" content="Lucky">

  <!-- required post metadata used by the generator -->
  <meta name="post-date" content="2025-12-01">
  <meta name="post-updated" content="2025-12-02"> <!-- optional -->
  <meta name="post-slug" content="2025-12-01-gpt-x-vs-gemini">
  <meta name="post-title" content="GPT-X vs Gemini — Quick Comparison">
  <meta name="post-summary" content="Short TL;DR of the post">
  <meta name="post-tags" content="LLM,benchmark,compare">
  <meta name="post-thumb" content="/assets/img/thumbs/gptx-gemini.jpg"> <!-- relative URL -->

  <!-- Open Graph / Twitter -->
  <meta property="og:title" content="GPT-X vs Gemini — Quick Comparison">
  <meta property="og:description" content="Short summary for social cards">
  <meta property="og:image" content="/assets/img/thumbs/gptx-gemini.jpg">
  <link rel="canonical" href="https://comparellms.in/posts/2025-12-01-gpt-x-vs-gemini/">

  <!-- JSON-LD Article: keep this in every post for SEO -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "GPT-X vs Gemini — Quick Comparison",
    "image": ["https://comparellms.in/assets/img/thumbs/gptx-gemini.jpg"],
    "datePublished": "2025-12-01",
    "dateModified": "2025-12-02",
    "author": {"@type": "Person","name":"Lucky"},
    "publisher": {"@type":"Organization","name":"comparellms","logo":{"@type":"ImageObject","url":"https://comparellms.in/assets/img/logo.png"}}
  }
  </script>
</head>
<body>
  <!-- post content: use semantic tags -->
  <article>
    <header>
      <h1>GPT-X vs Gemini — Quick Comparison</h1>
      <p class="byline">Published <time datetime="2025-12-01">Dec 1, 2025</time></p>
    </header>

    <section class="summary">TL;DR ...</section>
    <section class="content"> <!-- full article HTML --> </section>
    <footer class="post-meta">Tags: <a>LLM</a></footer>
  </article>
</body>
</html>
```

**Note for Copilot:** When generating a post file, always include the `meta` attributes listed above. The generator script will rely on them.

---

## 5) posts-index.json format (small, paginated)

**Why:** fetching hundreds of full HTML files on the Grid would be slow. Instead maintain a small JSON index that contains metadata and a small excerpt per post.

**Top-level `posts-index.json` structure (example for page 1):**

```json
{
  "page": 1,
  "per_page": 20,
  "total_posts": 512,
  "total_pages": 26,
  "posts": [
    {
      "slug": "2025-12-01-gpt-x-vs-gemini",
      "url": "/posts/2025-12-01-gpt-x-vs-gemini/",
      "title": "GPT-X vs Gemini — Quick Comparison",
      "date": "2025-12-01",
      "summary": "One-line summary for grid",
      "thumb": "/assets/img/thumbs/gptx-gemini.jpg",
      "tags": ["LLM","benchmark"]
    }
  ]
}
```

**Sharding/pagination:** If `total_posts` grows large, the generator creates `posts-index-page-1.json`, `posts-index-page-2.json`, ... and `posts-index.json` may simply point to the first page and `total_pages`.

---

## 6) blog-grid.js (client-side behavior requirements)

- On page load: fetch `posts-index.json` (or `posts-index-page-1.json`), render posts sorted by `date` descending so newest appears first.
- When user scrolls to bottom: lazy-load next `posts-index-page-N.json` (infinite scroll) or provide numbered pagination controls.
- Always show newest posts at the top (simple: array sort by `date` descending before render).
- Provide a client-side `refresh` action for editor preview: if `posts-index.json` timestamp changes, fetch new page and prepend new posts to top without full reload.
- Optimize DOM: render only visible cards for long lists or use pagination with small pages.
- Use `loading="lazy"` for images.

**Minimal example of the fetch & render flow** (this will be elaborated in `assets/js/blog-grid.js`):

```js
// pseudocode
async function loadPage(page=1){
  const res = await fetch(`/posts-index-page-${page}.json`);
  const data = await res.json();
  data.posts.sort((a,b)=> new Date(b.date)-new Date(a.date));
  renderCards(data.posts);
}
```

---

## 7) Python generator `scripts/generate_index_and_sitemap.py`

**Purpose:** scan `/posts/` folders, read meta tags from each `index.html`, and produce:
- `posts-index-page-1.json`, `posts-index-page-2.json`, ... (paginated)
- `posts-index.json` (meta that points to pages; or the first page)
- `sitemap.xml`
- `rss.xml` (basic RSS 2.0)

**Behavioral requirements:**
- Run locally before pushing, or run in GitHub Actions on `push`.
- Only update outputs when content has changed (compare previous outputs to avoid unnecessary commits).
- Be robust to missing optional meta (use sensible defaults; require `post-date` and `post-slug` or skip the post with a warning).
- Support `per_page` configurable via constant.

**Example implementation (Python 3, standard library)** — include this exact file in `scripts/generate_index_and_sitemap.py` so Copilot can create it.

```python
#!/usr/bin/env python3
"""
Simple generator: scans posts/*/index.html, extracts meta tags, and writes paginated JSON index + sitemap.xml + rss.xml
"""
import os
import re
import json
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring, ElementTree

POSTS_DIR = 'posts'
OUTPUT_INDEX_PREFIX = 'posts-index-page-'
OUTPUT_INDEX_MAIN = 'posts-index.json'
SITEMAP = 'sitemap.xml'
RSS = 'rss.xml'
PER_PAGE = 20
SITE_URL = 'https://comparellms.in'

META_RE = re.compile(r'<meta\s+name="([^"]+)"\s+content="([^"]*)"', re.I)


def read_meta_from_html(path):
    data = {}
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    for m in META_RE.finditer(html):
        data[m.group(1).strip()] = m.group(2).strip()
    return data


def gather_posts():
    posts = []
    for name in os.listdir(POSTS_DIR):
        folder = os.path.join(POSTS_DIR, name)
        indexf = os.path.join(folder, 'index.html')
        if os.path.isdir(folder) and os.path.exists(indexf):
            meta = read_meta_from_html(indexf)
            # basic validation
            slug = meta.get('post-slug') or name
            date = meta.get('post-date')
            title = meta.get('post-title') or meta.get('title') or slug
            summary = meta.get('post-summary','')
            thumb = meta.get('post-thumb','')
            tags = [t.strip() for t in meta.get('post-tags','').split(',') if t.strip()]
            if not date:
                print(f"WARN: post {slug} missing post-date — skipping")
                continue
            posts.append({
                'slug': slug,
                'url': f"/posts/{slug}/",
                'title': title,
                'date': date,
                'summary': summary,
                'thumb': thumb,
                'tags': tags
            })
    # sort desc by date
    posts.sort(key=lambda p: p['date'], reverse=True)
    return posts


def write_paginated_indexes(posts):
    total = len(posts)
    total_pages = (total + PER_PAGE - 1) // PER_PAGE
    for page in range(1, total_pages+1):
        start = (page-1)*PER_PAGE
        end = start + PER_PAGE
        page_posts = posts[start:end]
        out = {
            'page': page,
            'per_page': PER_PAGE,
            'total_posts': total,
            'total_pages': total_pages,
            'posts': page_posts
        }
        with open(f'{OUTPUT_INDEX_PREFIX}{page}.json','w',encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
    # write main pointer
    main = {'page': 1, 'total_pages': total_pages, 'per_page': PER_PAGE}
    with open(OUTPUT_INDEX_MAIN,'w',encoding='utf-8') as f:
        json.dump(main, f, ensure_ascii=False, indent=2)


def write_sitemap(posts):
    urlset = Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
    for p in posts:
        url = SubElement(urlset,'url')
        loc = SubElement(url,'loc')
        loc.text = SITE_URL.rstrip('/') + p['url']
        last = SubElement(url,'lastmod')
        last.text = p['date']
    tree = ElementTree(urlset)
    tree.write(SITEMAP, encoding='utf-8', xml_declaration=True)


def write_rss(posts):
    rss = Element('rss', version='2.0')
    channel = SubElement(rss,'channel')
    SubElement(channel,'title').text = 'comparellms'
    SubElement(channel,'link').text = SITE_URL
    SubElement(channel,'description').text = 'Daily LLM comparisons'
    for p in posts[:50]:  # only latest 50
        item = SubElement(channel,'item')
        SubElement(item,'title').text = p['title']
        SubElement(item,'link').text = SITE_URL.rstrip('/') + p['url']
        SubElement(item,'guid').text = SITE_URL.rstrip('/') + p['url']
        SubElement(item,'pubDate').text = p['date']
        SubElement(item,'description').text = p['summary']
    ElementTree(rss).write(RSS, encoding='utf-8', xml_declaration=True)


if __name__ == '__main__':
    posts = gather_posts()
    write_paginated_indexes(posts)
    write_sitemap(posts)
    write_rss(posts)
    print('Generated indexes, sitemap, rss')
```

**Note:** This script is intentionally dependency-free and robust. Copilot should place it at `scripts/generate_index_and_sitemap.py` and make it executable. If you prefer front-matter YAML parsing, we can add `pyyaml` later.

---

## 8) GitHub Action (optional but recommended)

**Purpose:** run generator after merges to `main`, and commit updated `posts-index-*.json`, `sitemap.xml`, `rss.xml` back to the repo. Use `GITHUB_TOKEN`.

**Minimal workflow `ci.yml`:**

```yaml
name: build-index
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Run generator
        run: |
          python3 scripts/generate_index_and_sitemap.py
      - name: Commit outputs
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
          git add posts-index-*.json sitemap.xml rss.xml
          if ! git diff --cached --quiet; then
            git commit -m 'chore: regenerate indexes and sitemap'
            git push
          else
            echo 'no changes'
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Security note:** Use the default `GITHUB_TOKEN` for simple workflows. For cross-repo pushes or different branches, configure PAT secrets with minimum scope.

---

## 9) AI Content Use Policy page (template)

**Purpose:** Explain how AI-generated content is handled. Include:
- Short statement of intent (transparency).
- What parts are AI-generated vs human-edited.
- Copyright & citation policy for model outputs.
- Safety and moderation guidelines (no disallowed content will be published; contact info and takedown request process).
- Link to contact and privacy.

**Short skeleton:**

```
<h1>AI Content Use Policy</h1>
<p>comparellms publishes comparisons that are produced with the assistance of AI tools and human review. We use AI (e.g., Gemini, other LLMs) to gather research and draft comparisons; every published article is reviewed and edited by a human editor before publication.</p>
<h2>What we mark as AI-assisted</h2>
<ul>
<li>Drafts that include model outputs are reviewed and corrected.</li>
<li>We cite sources where applicable and include summary notes.</li>
</ul>
<h2>Safety</h2>
<p>We do not publish content that violates laws or our safety standards. If you find a problematic post, contact us at <email> and we will review it within 48 hours.</p>
```

---

## 10) Production-grade considerations & recommendations

- **Static first**: build everything as static HTML so GitHub Pages can serve it quickly.
- **Index sharding**: always paginate `posts-index` to limit JSON sizes (20–50 per page).
- **Client performance:** lazy-load images, avoid pulling large JSONs at once; prefer server-side pagination (generator already does it).
- **Cache headers / CDN:** Use GitHub Pages with Cloudflare in front for edge caching and compression.
- **Image optimization:** store multiple sizes and use `srcset` and `sizes` attributes.
- **Backups:** keep a `content/` folder with source drafts (if you use Gemini outputs, store them raw in a safe place).
- **SEO:** JSON-LD, OG/Twitter tags, canonical links, sitemap, RSS, structured filenames.
- **Security:** apply Content Security Policy, escape user-generated content in templates, avoid inline JS where possible.
- **CI checks:** lint HTML, run link checkers, and preview changes via `gh-pages` or branches.

---

## 11) Editor workflow (manual + automated)

**Manual post workflow:**
1. Create a new folder: `posts/YYYY-MM-DD-slug/`
2. Add `index.html` using the Post HTML template and fill required meta tags.
3. Run `python3 scripts/generate_index_and_sitemap.py` locally (optional: commit generated files) OR push branch and rely on GitHub Action to regenerate index.
4. Open PR, review, merge.

**Automated workflow:** GitHub Action runs generator after merge to `main` and commits `posts-index` and `sitemap` updates automatically.

---

## 12) Copilot task prompts (explicit instructions you can paste)

Use these prompts as direct instructions for Copilot to create files.

1. **Create base site skeleton**

```
"Create the site skeleton for comparellms.in using plain HTML/CSS/JS. Make index.html, about.html, ai-content-policy.html, contact.html, 404.html, /blog/index.html and the folder structure shown in the repo layout section. Add a small responsive CSS file at assets/css/main.css and an assets/js/blog-grid.js that fetches `posts-index-page-1.json` and renders cards sorted newest-first. Use semantic HTML and include placeholder content and TODO comments where needed."
```

2. **Create post template**

```
"Create a post HTML template file at templates/post-template.html that includes all required meta tags (post-date, post-slug, post-title, post-summary, post-tags, post-thumb), JSON-LD Article, canonical link, and a semantic article structure. Include a short example body."
```

3. **Create generator script**

```
"Create scripts/generate_index_and_sitemap.py which scans posts/*/index.html, extracts meta tags, writes paginated posts-index-page-N.json files, writes posts-index.json summary file, sitemap.xml and rss.xml. Use only Python standard library. Match the example implementation in the context file."
```

4. **Create GitHub Action**

```
"Create .github/workflows/ci.yml that checks out the repo, runs python3 scripts/generate_index_and_sitemap.py and commits posts-index-*.json sitemap.xml rss.xml back to the repo if changed. Use actions/checkout@v4 and actions/setup-python@v4."
```

---

## 13) Checklist before first push (quick)

- [ ] Template files for posts and grid exist
- [ ] `scripts/generate_index_and_sitemap.py` present and executable
- [ ] `posts/` has at least one real post using the template
- [ ] `posts-index-page-1.json` generated
- [ ] `sitemap.xml` and `rss.xml` generated
- [ ] `robots.txt` present
- [ ] GitHub Action configured in `.github/workflows`

---

## 14) Scaling notes when you hit 500+ posts

- Create monthly or yearly archive pages in addition to paginated `posts-index` files.
- Consider a pre-rendered set of list pages (`/archive/2025/12/`) to reduce client JS.
- If client-side performance becomes an issue, switch to a simple static site generator (Eleventy, Hugo) or a minimal Node/Python build step to produce fully pre-rendered list pages.

---

## 15) Final notes for Copilot (voice & constraints)

- Keep code dependency-free unless explicitly asked to add libraries.
- Favor readable and well-documented code with TODO comments for future improvements (image optimization, search, tag pages).
- Aim for progressive enhancement — make everything work without JavaScript, and enhance with JS.
- For any generated file that touches SEO (sitemap, post date, canonical), follow the formats exactly.

---

If you want, I can now generate the initial repository files (index.html, a sample post, `scripts/generate_index_and_sitemap.py`, `assets/js/blog-grid.js`, and the GitHub workflow) and place them in a single zip you can unzip into your repo. Just tell me to proceed and I will create those files.

