# comparellms

> Daily LLM comparisons and AI model benchmarks at [comparellms.in](https://comparellms.in)

A static, multi-page HTML website hosted on GitHub Pages for comparing Large Language Models (LLMs) and AI models.

## 🚀 Features

- **Static Site**: Pure HTML/CSS/JS with no build step required
- **Dynamic Blog Grid**: Client-side rendering from JSON index files
- **Automated Index Generation**: Python script generates `posts-index.json`, `sitemap.xml`, and `rss.xml`
- **GitHub Actions CI**: Automatic regeneration on push to main
- **SEO Optimized**: JSON-LD schema, OpenGraph tags, sitemap, RSS
- **Responsive Design**: Mobile-first CSS with dark mode support
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigation

---

## 📋 Table of Contents

- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [How to Create a New Post](#-how-to-create-a-new-post)
- [How to Add Featured Image (Thumbnail)](#-how-to-add-featured-image-thumbnail)
- [How to Update Favicon](#-how-to-update-favicon)
- [Required Post Meta Tags](#-required-post-meta-tags)
- [Automation](#-automation)
- [Customization](#-customization)

---

## 📁 Project Structure

```
/
├── index.html                    # Home page (hero + latest posts)
├── about.html                    # About page
├── ai-content-policy.html        # AI content use policy
├── contact.html                  # Contact form
├── 404.html                      # Error page
├── blog/
│   └── index.html                # Blog listing page
├── posts/                        # Blog posts (one folder per post)
│   └── your-post-slug/
│       └── index.html
├── assets/
│   ├── css/
│   │   └── main.css              # Main stylesheet
│   ├── js/
│   │   ├── blog-grid.js          # Blog grid rendering
│   │   └── utils.js              # Utility functions
│   └── img/
│       ├── thumbs/               # Post thumbnails go here
│       ├── favicon.ico           # Site favicon
│       └── og-image.jpg          # Default social share image
├── templates/
│   └── post-template.html        # Template for new posts
├── scripts/
│   └── generate_index_and_sitemap.py  # Index/sitemap generator
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions workflow
├── posts-index.json              # Main index (generated)
├── posts-index-page-1.json       # Paginated index (generated)
├── sitemap.xml                   # Sitemap (generated)
├── rss.xml                       # RSS feed (generated)
├── robots.txt                    # Robots file
└── README.md                     # This file
```

---

## 🛠️ Getting Started

### Prerequisites

- Python 3.10+ (for the generator script)
- A web server for local development (e.g., `python -m http.server`)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Luckyyaduvanshiofficial/comparellms.in.git
   cd comparellms.in
   ```

2. Start a local server:
   ```bash
   python -m http.server 8080
   ```

3. Open `http://localhost:8080` in your browser

---

## 📝 How to Create a New Post

### Step 1: Create Post Folder

Create a new folder inside `posts/` with a URL-friendly slug name:

```bash
mkdir posts/your-post-slug
```

**Naming convention:**
- Use lowercase letters
- Use hyphens instead of spaces
- Keep it short but descriptive
- Example: `gpt-4-vs-claude-3`, `gemini-2-review`

### Step 2: Create index.html

Create `index.html` inside your new folder:

```bash
# Option A: Copy from template
cp templates/post-template.html posts/your-post-slug/index.html

# Option B: Create from scratch with required structure
```

### Step 3: Add Required Meta Tags

Your post **MUST** include these meta tags in the `<head>` section:

```html
<head>
    <!-- Required meta tags for post indexing -->
    <meta name="post-slug" content="your-post-slug">
    <meta name="post-date" content="2025-12-02">
    <meta name="post-title" content="Your Post Title Here">
    <meta name="post-summary" content="A brief description of your post (shows on cards)">
    <meta name="post-thumb" content="/assets/img/thumbs/your-thumbnail.jpg">
    <meta name="post-tags" content="Tag1, Tag2, Tag3">
    
    <!-- Standard meta tags -->
    <meta name="description" content="Your post description for SEO">
    <title>Your Post Title — comparellms</title>
</head>
```

### Step 4: Write Your Content

Add your post content inside the `<article>` section. You can use:
- Headings: `<h2>`, `<h3>`, `<h4>`
- Paragraphs: `<p>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Code blocks: `<pre><code>...</code></pre>`
- Tables: `<table>...</table>`
- Blockquotes: `<blockquote>...</blockquote>`
- Images: `<img src="..." alt="...">`

### Step 5: Generate Index

Run the generator script to add your post to the index:

```bash
python scripts/generate_index_and_sitemap.py
```

You should see:
```
INFO: Found X valid posts
INFO: Wrote posts-index-page-1.json
INFO: Wrote posts-index.json
INFO: Wrote sitemap.xml
INFO: Wrote rss.xml
```

### Step 6: Test Locally

```bash
python -m http.server 8080
```

Visit `http://localhost:8080` and verify your post appears.

### Step 7: Deploy

```bash
git add .
git commit -m "Add new post: your-post-title"
git push
```

---

## 🖼️ How to Add Featured Image (Thumbnail)

### Step 1: Prepare Your Image

**Recommended specifications:**
- **Size**: 1200 x 630 pixels (16:9 ratio)
- **Format**: JPG or PNG (JPG preferred for smaller file size)
- **File size**: Under 200KB for fast loading
- **File name**: Use the same slug as your post

### Step 2: Save to Thumbs Folder

Place your thumbnail in:
```
assets/img/thumbs/your-post-slug.jpg
```

**Example:**
```
assets/img/thumbs/gpt-4-vs-claude-3.jpg
assets/img/thumbs/neno-banana-vs-neno-banana-pro.jpg
```

### Step 3: Update Meta Tag

In your post's `index.html`, set the `post-thumb` meta tag:

```html
<meta name="post-thumb" content="/assets/img/thumbs/your-post-slug.jpg">
```

**Important:** Use the absolute path starting with `/assets/`

### Step 4: Regenerate Index

```bash
python scripts/generate_index_and_sitemap.py
```

### Thumbnail Tips

| Tip | Description |
|-----|-------------|
| 🎨 **Consistency** | Use similar style/colors for all thumbnails |
| 📏 **Aspect Ratio** | Stick to 16:9 or 16:10 for best display |
| 🔤 **Text** | If adding text, keep it large and readable |
| 🗜️ **Compress** | Use [TinyPNG](https://tinypng.com) to reduce file size |
| 🖼️ **Fallback** | A default image shows if thumbnail is missing |

---

## 🔖 How to Update Favicon

### Step 1: Create Favicon Files

Create these favicon files:
- `favicon.ico` (32x32 or 16x16, ICO format)
- `favicon-32x32.png` (32x32, PNG)
- `favicon-16x16.png` (16x16, PNG)
- `apple-touch-icon.png` (180x180, PNG)

**Tools to generate favicons:**
- [Favicon.io](https://favicon.io) - Generate from text, image, or emoji
- [RealFaviconGenerator](https://realfavicongenerator.net) - Comprehensive generator

### Step 2: Save Files

Place favicon files in:
```
assets/img/favicon.ico
assets/img/favicon-32x32.png
assets/img/favicon-16x16.png
assets/img/apple-touch-icon.png
```

### Step 3: Update HTML Head

Add/update these lines in ALL HTML files (`index.html`, `about.html`, `contact.html`, etc.):

```html
<head>
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
</head>
```

**For posts** (inside `posts/` folder), use relative paths:
```html
<link rel="icon" type="image/x-icon" href="../../assets/img/favicon.ico">
```

### Step 4: Update Manifest (Optional)

Create `site.webmanifest` in root folder:
```json
{
    "name": "comparellms",
    "short_name": "comparellms",
    "icons": [
        {
            "src": "/assets/img/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/assets/img/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "theme_color": "#7c3aed",
    "background_color": "#030712",
    "display": "standalone"
}
```

---

## 🏷️ Required Post Meta Tags

| Meta Tag | Required | Description | Example |
|----------|----------|-------------|---------|
| `post-slug` | ✅ | URL-friendly identifier | `gpt-4-vs-claude-3` |
| `post-date` | ✅ | Publication date (YYYY-MM-DD) | `2025-12-02` |
| `post-title` | ✅ | Display title | `GPT-4 vs Claude 3` |
| `post-summary` | ✅ | Short description (for cards) | `A comprehensive comparison...` |
| `post-thumb` | ⭕ | Thumbnail path | `/assets/img/thumbs/image.jpg` |
| `post-tags` | ⭕ | Comma-separated tags | `GPT-4, Claude, Comparison` |
| `post-updated` | ⭕ | Last update date | `2025-12-05` |

✅ = Required | ⭕ = Optional (but recommended)

---

## 🔄 Automation

The GitHub Action (`.github/workflows/ci.yml`) automatically:
1. Runs on every push to `main`
2. Executes `scripts/generate_index_and_sitemap.py`
3. Commits updated `posts-index-*.json`, `sitemap.xml`, and `rss.xml`

**You don't need to run the generator manually** if you push to GitHub - the CI will handle it!

---

## 🎨 Customization

### Colors

Edit CSS variables in `assets/css/main.css`:

```css
:root {
  --color-primary: #7c3aed;      /* Purple */
  --color-secondary: #06b6d4;    /* Cyan */
  --color-accent: #f59e0b;       /* Amber */
  /* ... */
}
```

### Posts Per Page

Edit `PER_PAGE` in `scripts/generate_index_and_sitemap.py`:

```python
PER_PAGE = 20  # Change to your preferred number
```

### Site Info

Edit these in `scripts/generate_index_and_sitemap.py`:

```python
SITE_URL = 'https://comparellms.in'
SITE_NAME = 'comparellms'
SITE_DESCRIPTION = 'Daily LLM comparisons and AI model benchmarks'
```

---

## 📊 Posts Index Format

The generator creates paginated JSON files:

```json
{
  "page": 1,
  "per_page": 20,
  "total_posts": 50,
  "total_pages": 3,
  "posts": [
    {
      "slug": "gpt-4-vs-claude-3",
      "url": "/posts/gpt-4-vs-claude-3/",
      "title": "GPT-4 vs Claude 3",
      "date": "2025-12-02",
      "summary": "...",
      "thumb": "/assets/img/thumbs/...",
      "tags": ["GPT-4", "Claude"]
    }
  ]
}
```

---

## 📝 License

MIT License - feel free to use this for your own projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

Questions? Reach out via the [contact page](https://comparellms.in/contact.html).
