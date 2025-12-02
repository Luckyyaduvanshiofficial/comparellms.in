#!/usr/bin/env python3
"""
generate_index_and_sitemap.py

Simple generator: scans posts/*/index.html, extracts meta tags, and writes:
- Paginated JSON index files (posts-index-page-N.json)
- Main index pointer (posts-index.json)
- sitemap.xml
- rss.xml

Uses only Python standard library for zero-dependency CI runs.
"""
import os
import re
import json
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring, ElementTree

# =============================================================================
# Configuration
# =============================================================================
POSTS_DIR = 'posts'
OUTPUT_INDEX_PREFIX = 'posts-index-page-'
OUTPUT_INDEX_MAIN = 'posts-index.json'
SITEMAP = 'sitemap.xml'
RSS = 'rss.xml'
PER_PAGE = 20
SITE_URL = 'https://comparellms.in'
SITE_NAME = 'comparellms'
SITE_DESCRIPTION = 'Daily LLM comparisons and AI model benchmarks'

# Regex to extract meta tags from HTML
META_RE = re.compile(r'<meta\s+name=["\']([^"\']+)["\']\s+content=["\']([^"\']*)["\']', re.I)
META_RE_ALT = re.compile(r'<meta\s+content=["\']([^"\']*)["\']s+name=["\']([^"\']+)["\']', re.I)

# =============================================================================
# Helper Functions
# =============================================================================

def read_meta_from_html(path: str) -> dict:
    """
    Read HTML file and extract meta tag name/content pairs.
    Returns a dictionary of meta tag values.
    """
    data = {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Find all meta tags with name="..." content="..." format
        for match in META_RE.finditer(html):
            name = match.group(1).strip().lower()
            content = match.group(2).strip()
            data[name] = content
        
        # Also try alternate format content="..." name="..."
        for match in META_RE_ALT.finditer(html):
            content = match.group(1).strip()
            name = match.group(2).strip().lower()
            if name not in data:
                data[name] = content
                
    except Exception as e:
        print(f"ERROR: Could not read {path}: {e}")
    
    return data


def gather_posts() -> list:
    """
    Scan the posts directory and gather metadata from each post.
    Returns a list of post objects sorted by date (newest first).
    """
    posts = []
    
    if not os.path.isdir(POSTS_DIR):
        print(f"WARN: Posts directory '{POSTS_DIR}' not found")
        return posts
    
    for name in os.listdir(POSTS_DIR):
        folder = os.path.join(POSTS_DIR, name)
        index_file = os.path.join(folder, 'index.html')
        
        # Skip if not a directory or no index.html
        if not os.path.isdir(folder):
            continue
        if not os.path.exists(index_file):
            print(f"WARN: No index.html found in {folder}")
            continue
        
        # Read meta tags from the post
        meta = read_meta_from_html(index_file)
        
        # Extract required and optional fields
        slug = meta.get('post-slug') or name
        date = meta.get('post-date')
        title = meta.get('post-title') or meta.get('title') or slug
        summary = meta.get('post-summary') or meta.get('description', '')
        thumb = meta.get('post-thumb', '')
        tags_raw = meta.get('post-tags', '')
        updated = meta.get('post-updated', '')
        
        # Parse tags (comma-separated)
        tags = [t.strip() for t in tags_raw.split(',') if t.strip()]
        
        # Validate required fields
        if not date:
            print(f"WARN: Post '{slug}' missing post-date — skipping")
            continue
        
        # Validate date format
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            print(f"WARN: Post '{slug}' has invalid date format '{date}' — skipping")
            continue
        
        posts.append({
            'slug': slug,
            'url': f"/posts/{slug}/",
            'title': title,
            'date': date,
            'updated': updated,
            'summary': summary,
            'thumb': thumb,
            'tags': tags
        })
    
    # Sort by date descending (newest first)
    posts.sort(key=lambda p: p['date'], reverse=True)
    
    print(f"INFO: Found {len(posts)} valid posts")
    return posts


def write_paginated_indexes(posts: list) -> None:
    """
    Write paginated JSON index files and main index pointer.
    """
    total = len(posts)
    total_pages = max(1, (total + PER_PAGE - 1) // PER_PAGE)
    
    # Write each page
    for page in range(1, total_pages + 1):
        start = (page - 1) * PER_PAGE
        end = start + PER_PAGE
        page_posts = posts[start:end]
        
        output = {
            'page': page,
            'per_page': PER_PAGE,
            'total_posts': total,
            'total_pages': total_pages,
            'posts': page_posts
        }
        
        filename = f'{OUTPUT_INDEX_PREFIX}{page}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"INFO: Wrote {filename}")
    
    # Write main index pointer
    main = {
        'page': 1,
        'per_page': PER_PAGE,
        'total_posts': total,
        'total_pages': total_pages
    }
    with open(OUTPUT_INDEX_MAIN, 'w', encoding='utf-8') as f:
        json.dump(main, f, ensure_ascii=False, indent=2)
    print(f"INFO: Wrote {OUTPUT_INDEX_MAIN}")


def write_sitemap(posts: list) -> None:
    """
    Generate sitemap.xml from posts list.
    Includes all posts plus static pages.
    """
    urlset = Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    # Add static pages
    static_pages = [
        ('/', '2025-01-01', 'daily', '1.0'),
        ('/blog/', '2025-01-01', 'daily', '0.9'),
        ('/about.html', '2025-01-01', 'monthly', '0.5'),
        ('/contact.html', '2025-01-01', 'monthly', '0.5'),
        ('/ai-content-policy.html', '2025-01-01', 'monthly', '0.5'),
    ]
    
    for path, lastmod, freq, priority in static_pages:
        url_el = SubElement(urlset, 'url')
        loc = SubElement(url_el, 'loc')
        loc.text = SITE_URL.rstrip('/') + path
        lastmod_el = SubElement(url_el, 'lastmod')
        lastmod_el.text = lastmod
        changefreq = SubElement(url_el, 'changefreq')
        changefreq.text = freq
        priority_el = SubElement(url_el, 'priority')
        priority_el.text = priority
    
    # Add posts
    for post in posts:
        url_el = SubElement(urlset, 'url')
        loc = SubElement(url_el, 'loc')
        loc.text = SITE_URL.rstrip('/') + post['url']
        lastmod = SubElement(url_el, 'lastmod')
        lastmod.text = post.get('updated') or post['date']
        changefreq = SubElement(url_el, 'changefreq')
        changefreq.text = 'monthly'
        priority_el = SubElement(url_el, 'priority')
        priority_el.text = '0.7'
    
    # Write XML with declaration
    tree = ElementTree(urlset)
    with open(SITEMAP, 'wb') as f:
        tree.write(f, encoding='utf-8', xml_declaration=True)
    print(f"INFO: Wrote {SITEMAP}")


def format_rss_date(date_str: str) -> str:
    """
    Convert YYYY-MM-DD to RFC 822 date format for RSS.
    """
    try:
        dt = datetime.strptime(date_str, '%Y-%m-%d')
        return dt.strftime('%a, %d %b %Y 00:00:00 GMT')
    except ValueError:
        return date_str


def write_rss(posts: list) -> None:
    """
    Generate RSS 2.0 feed from posts list.
    Includes only the latest 50 posts.
    """
    rss = Element('rss')
    rss.set('version', '2.0')
    rss.set('xmlns:atom', 'http://www.w3.org/2005/Atom')
    
    channel = SubElement(rss, 'channel')
    
    # Channel metadata
    SubElement(channel, 'title').text = SITE_NAME
    SubElement(channel, 'link').text = SITE_URL
    SubElement(channel, 'description').text = SITE_DESCRIPTION
    SubElement(channel, 'language').text = 'en-us'
    SubElement(channel, 'lastBuildDate').text = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
    
    # Atom self link
    atom_link = SubElement(channel, '{http://www.w3.org/2005/Atom}link')
    atom_link.set('href', f'{SITE_URL}/rss.xml')
    atom_link.set('rel', 'self')
    atom_link.set('type', 'application/rss+xml')
    
    # Add posts (latest 50)
    for post in posts[:50]:
        item = SubElement(channel, 'item')
        SubElement(item, 'title').text = post['title']
        SubElement(item, 'link').text = SITE_URL.rstrip('/') + post['url']
        SubElement(item, 'guid').text = SITE_URL.rstrip('/') + post['url']
        SubElement(item, 'pubDate').text = format_rss_date(post['date'])
        SubElement(item, 'description').text = post['summary']
        
        # Add categories (tags)
        for tag in post.get('tags', []):
            category = SubElement(item, 'category')
            category.text = tag
    
    # Write XML with declaration
    tree = ElementTree(rss)
    with open(RSS, 'wb') as f:
        tree.write(f, encoding='utf-8', xml_declaration=True)
    print(f"INFO: Wrote {RSS}")


def cleanup_old_index_files() -> None:
    """
    Remove old paginated index files that are no longer needed.
    """
    import glob
    pattern = f'{OUTPUT_INDEX_PREFIX}*.json'
    for filepath in glob.glob(pattern):
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"WARN: Could not remove {filepath}: {e}")


# =============================================================================
# Main
# =============================================================================

def main():
    print("=" * 60)
    print("comparellms Index & Sitemap Generator")
    print("=" * 60)
    
    # Gather posts
    posts = gather_posts()
    
    if not posts:
        print("WARN: No posts found. Creating empty indexes.")
    
    # Clean up old files
    cleanup_old_index_files()
    
    # Generate outputs
    write_paginated_indexes(posts)
    write_sitemap(posts)
    write_rss(posts)
    
    print("=" * 60)
    print("Generation complete!")
    print(f"  - Total posts: {len(posts)}")
    print(f"  - Index pages: {max(1, (len(posts) + PER_PAGE - 1) // PER_PAGE)}")
    print("=" * 60)


if __name__ == '__main__':
    main()
