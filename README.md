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
│   ├── 2025-12-02-gpt4o-vs-claude35-sonnet/
│   │   └── index.html
│   └── 2025-12-01-gemini2-vs-gpt4-turbo/
│       └── index.html
├── assets/
│   ├── css/
│   │   └── main.css              # Main stylesheet
│   ├── js/
│   │   ├── blog-grid.js          # Blog grid rendering
│   │   └── utils.js              # Utility functions
│   └── img/                      # Images and thumbnails
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

## 🛠️ Getting Started

### Prerequisites

- Python 3.10+ (for the generator script)
- A web server for local development (e.g., `python -m http.server`)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/comparellms.git
   cd comparellms
   ```

2. Start a local server:
   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser

### Creating a New Post

1. Copy the template:
   ```bash
   mkdir posts/YYYY-MM-DD-your-slug
   cp templates/post-template.html posts/YYYY-MM-DD-your-slug/index.html
   ```

2. Edit the new `index.html`:
   - Update all meta tags (post-date, post-slug, post-title, post-summary, post-tags)
   - Replace placeholder content
   - Add your comparison content

3. Run the generator:
   ```bash
   python scripts/generate_index_and_sitemap.py
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add new post: your-post-title"
   git push
   ```

### Required Post Meta Tags

Each post must include these meta tags in the `<head>`:

```html
<meta name="post-date" content="2025-12-02">
<meta name="post-slug" content="2025-12-02-your-slug">
<meta name="post-title" content="Your Post Title">
<meta name="post-summary" content="Short summary for cards">
<meta name="post-tags" content="tag1,tag2,tag3">
<meta name="post-thumb" content="/assets/img/thumbs/your-image.jpg">
```

## 🔄 Automation

The GitHub Action (`.github/workflows/ci.yml`) automatically:
1. Runs on push to `main`
2. Executes `scripts/generate_index_and_sitemap.py`
3. Commits updated `posts-index-*.json`, `sitemap.xml`, and `rss.xml`

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
      "slug": "2025-12-02-gpt4o-vs-claude35",
      "url": "/posts/2025-12-02-gpt4o-vs-claude35/",
      "title": "GPT-4o vs Claude 3.5 Sonnet",
      "date": "2025-12-02",
      "summary": "...",
      "thumb": "/assets/img/thumbs/...",
      "tags": ["GPT-4o", "Claude"]
    }
  ]
}
```

## 🎨 Customization

### Colors

Edit CSS variables in `assets/css/main.css`:

```css
:root {
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  /* ... */
}
```

### Posts Per Page

Edit `PER_PAGE` in `scripts/generate_index_and_sitemap.py`:

```python
PER_PAGE = 20  # Change to your preferred number
```

## 📝 License

MIT License - feel free to use this for your own projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

Questions? Reach out via the [contact page](https://comparellms.in/contact.html).
