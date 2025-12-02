/**
 * blog-grid.js
 * Handles fetching and rendering posts from posts-index-page-N.json files
 * Features: pagination, lazy loading, search filtering, newest-first sorting
 */

// Detect if running on a server or local file system
function getBasePath() {
  // If running on a server (http/https), use root-relative paths
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    return '/';
  }
  // For local file system, use relative paths based on current location
  const path = window.location.pathname;
  if (path.includes('/blog/')) {
    return '../';
  } else if (path.includes('/posts/')) {
    return '../../';
  }
  return './';
}

const BASE_PATH = getBasePath();

// Configuration
const CONFIG = {
  indexPrefix: BASE_PATH + 'posts-index-page-',
  indexSuffix: '.json',
  mainIndex: BASE_PATH + 'posts-index.json',
  postsPerPage: 20,
  maxVisiblePages: 5,
  enableInfiniteScroll: false, // Set to true for infinite scroll instead of pagination
  lazyLoadThreshold: 200, // pixels from bottom to trigger next page load
};

// State
const state = {
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
  allPosts: [],
  filteredPosts: [],
  isLoading: false,
  searchQuery: '',
  activeTag: null,
};

// DOM Elements
let postsGrid = null;
let paginationEl = null;
let loadMoreBtn = null;
let loadingIndicator = null;
let noResultsEl = null;
let searchInput = null;
let tagFiltersEl = null;

/**
 * Initialize the blog grid
 */
export async function init() {
  // Get DOM elements
  postsGrid = document.getElementById('posts-grid');
  paginationEl = document.getElementById('pagination');
  loadMoreBtn = document.getElementById('load-more-btn');
  loadingIndicator = document.getElementById('loading');
  noResultsEl = document.getElementById('no-results');
  searchInput = document.getElementById('search-posts');
  tagFiltersEl = document.getElementById('tag-filters');

  if (!postsGrid) return;

  // Set up event listeners
  setupEventListeners();

  // Load initial data
  await loadMainIndex();
  await loadPage(1);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadNextPage);
  }

  // Infinite scroll (if enabled)
  if (CONFIG.enableInfiniteScroll) {
    window.addEventListener('scroll', debounce(handleScroll, 100));
  }
}

/**
 * Load the main index file to get pagination info
 */
async function loadMainIndex() {
  try {
    const response = await fetch(CONFIG.mainIndex);
    if (!response.ok) {
      // If main index doesn't exist, try loading page 1 directly
      return;
    }
    const data = await response.json();
    state.totalPages = data.total_pages || 1;
    state.totalPosts = data.total_posts || 0;
  } catch (error) {
    console.warn('Could not load main index, will try loading pages directly');
  }
}

/**
 * Load a specific page of posts
 * @param {number} page - Page number to load
 */
async function loadPage(page) {
  if (state.isLoading) return;

  state.isLoading = true;
  showLoading(true);

  try {
    const url = `${CONFIG.indexPrefix}${page}${CONFIG.indexSuffix}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load page ${page}`);
    }

    const data = await response.json();

    // Update state
    state.currentPage = page;
    state.totalPages = data.total_pages || 1;
    state.totalPosts = data.total_posts || data.posts.length;

    // Sort posts by date descending (newest first)
    const posts = sortPostsByDate(data.posts);

    // Render based on mode
    if (CONFIG.enableInfiniteScroll && page > 1) {
      // Append posts for infinite scroll
      state.allPosts = [...state.allPosts, ...posts];
      appendPosts(posts);
    } else {
      // Replace posts for pagination
      state.allPosts = posts;
      renderPosts(posts);
    }

    // Extract and render tags
    renderTagFilters(extractAllTags(state.allPosts));

    // Render pagination
    if (!CONFIG.enableInfiniteScroll && paginationEl) {
      renderPagination();
    }

    // Show/hide load more button
    updateLoadMoreButton();

  } catch (error) {
    console.error('Error loading posts:', error);
    showError('Failed to load posts. Please try again later.');
  } finally {
    state.isLoading = false;
    showLoading(false);
  }
}

/**
 * Load the next page of posts
 */
async function loadNextPage() {
  if (state.currentPage < state.totalPages) {
    await loadPage(state.currentPage + 1);
  }
}

/**
 * Sort posts by date in descending order (newest first)
 * @param {Array} posts - Array of post objects
 * @returns {Array} Sorted array
 */
function sortPostsByDate(posts) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Render posts to the grid
 * @param {Array} posts - Array of post objects
 */
function renderPosts(posts) {
  if (!postsGrid) return;

  // Clear existing posts (except loading indicator)
  const existingCards = postsGrid.querySelectorAll('.post-card');
  existingCards.forEach(card => card.remove());

  if (posts.length === 0) {
    showNoResults(true);
    return;
  }

  showNoResults(false);
  appendPosts(posts);
}

/**
 * Append posts to the grid (for infinite scroll)
 * @param {Array} posts - Array of post objects
 */
function appendPosts(posts) {
  if (!postsGrid) return;

  const fragment = document.createDocumentFragment();

  posts.forEach(post => {
    const card = createPostCard(post);
    fragment.appendChild(card);
  });

  postsGrid.appendChild(fragment);
}

/**
 * Create a post card element
 * @param {Object} post - Post data object
 * @returns {HTMLElement} Post card element
 */
function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';

  const formattedDate = formatDate(post.date);
  const tags = Array.isArray(post.tags) ? post.tags : [];
  
  // Convert URLs - use absolute for server, relative for local files
  let postUrl, thumbUrl;
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    // Server: use URLs as-is from JSON (they're already absolute like /posts/slug/)
    postUrl = post.url;
    thumbUrl = post.thumb || '';
  } else {
    // Local file: convert to relative paths
    postUrl = BASE_PATH + post.url.replace(/^\//, '') + 'index.html';
    thumbUrl = post.thumb ? BASE_PATH + post.thumb.replace(/^\//, '') : '';
  }

  card.innerHTML = `
    <div class="post-card-thumb">
      ${thumbUrl 
        ? `<img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(post.title)}" loading="lazy">`
        : `<div class="placeholder-thumb"></div>`
      }
    </div>
    <div class="post-card-content">
      <time class="post-card-date" datetime="${escapeHtml(post.date)}">${formattedDate}</time>
      <h3 class="post-card-title">
        <a href="${escapeHtml(postUrl)}">${escapeHtml(post.title)}</a>
      </h3>
      <p class="post-card-summary">${escapeHtml(post.summary || '')}</p>
      <div class="post-card-tags">
        ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </div>
  `;

  // Add click handler for tags
  card.querySelectorAll('.tag').forEach(tagEl => {
    tagEl.addEventListener('click', (e) => {
      e.preventDefault();
      filterByTag(tagEl.textContent);
    });
  });

  return card;
}

/**
 * Render pagination controls
 */
function renderPagination() {
  if (!paginationEl || state.totalPages <= 1) {
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  const { currentPage, totalPages } = state;
  let html = '';

  // Previous button
  html += `
    <button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
      ← Prev
    </button>
  `;

  // Page numbers
  const pages = getVisiblePageNumbers(currentPage, totalPages, CONFIG.maxVisiblePages);
  
  pages.forEach(page => {
    if (page === '...') {
      html += `<span class="pagination-ellipsis">...</span>`;
    } else {
      html += `
        <button class="${page === currentPage ? 'active' : ''}" data-page="${page}">
          ${page}
        </button>
      `;
    }
  });

  // Next button
  html += `
    <button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
      Next →
    </button>
  `;

  paginationEl.innerHTML = html;

  // Add click handlers
  paginationEl.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page, 10);
      if (page > 0 && page <= totalPages) {
        loadPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/**
 * Get array of visible page numbers for pagination
 * @param {number} current - Current page
 * @param {number} total - Total pages
 * @param {number} maxVisible - Max visible page numbers
 * @returns {Array} Array of page numbers and ellipsis
 */
function getVisiblePageNumbers(current, total, maxVisible) {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total) {
    if (end < total - 1) pages.push('...');
    pages.push(total);
  }

  return pages;
}

/**
 * Handle search input
 */
function handleSearch(event) {
  state.searchQuery = event.target.value.toLowerCase().trim();
  filterPosts();
}

/**
 * Filter posts by tag
 * @param {string} tag - Tag to filter by
 */
function filterByTag(tag) {
  if (state.activeTag === tag) {
    state.activeTag = null;
  } else {
    state.activeTag = tag;
  }
  filterPosts();
  updateTagFiltersUI();
}

/**
 * Filter posts based on search query and active tag
 */
function filterPosts() {
  let filtered = [...state.allPosts];

  // Filter by search query
  if (state.searchQuery) {
    filtered = filtered.filter(post => {
      const title = (post.title || '').toLowerCase();
      const summary = (post.summary || '').toLowerCase();
      const tags = (post.tags || []).join(' ').toLowerCase();
      return title.includes(state.searchQuery) || 
             summary.includes(state.searchQuery) ||
             tags.includes(state.searchQuery);
    });
  }

  // Filter by tag
  if (state.activeTag) {
    filtered = filtered.filter(post => {
      const tags = post.tags || [];
      return tags.includes(state.activeTag);
    });
  }

  state.filteredPosts = filtered;
  renderPosts(filtered);
}

/**
 * Extract all unique tags from posts
 * @param {Array} posts - Array of post objects
 * @returns {Array} Array of unique tags
 */
function extractAllTags(posts) {
  const tagSet = new Set();
  posts.forEach(post => {
    (post.tags || []).forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Render tag filter buttons
 * @param {Array} tags - Array of tag strings
 */
function renderTagFilters(tags) {
  if (!tagFiltersEl || tags.length === 0) return;

  tagFiltersEl.innerHTML = tags.map(tag => `
    <button class="tag ${state.activeTag === tag ? 'active' : ''}" data-tag="${escapeHtml(tag)}">
      ${escapeHtml(tag)}
    </button>
  `).join('');

  tagFiltersEl.querySelectorAll('.tag').forEach(btn => {
    btn.addEventListener('click', () => filterByTag(btn.dataset.tag));
  });
}

/**
 * Update tag filters UI to show active state
 */
function updateTagFiltersUI() {
  if (!tagFiltersEl) return;
  
  tagFiltersEl.querySelectorAll('.tag').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tag === state.activeTag);
  });
}

/**
 * Handle scroll for infinite scroll
 */
function handleScroll() {
  if (state.isLoading || state.currentPage >= state.totalPages) return;

  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollY + windowHeight >= documentHeight - CONFIG.lazyLoadThreshold) {
    loadNextPage();
  }
}

/**
 * Show/hide loading indicator
 * @param {boolean} show - Whether to show loading
 */
function showLoading(show) {
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? 'block' : 'none';
  }
}

/**
 * Show/hide no results message
 * @param {boolean} show - Whether to show no results
 */
function showNoResults(show) {
  if (noResultsEl) {
    noResultsEl.style.display = show ? 'block' : 'none';
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  if (postsGrid) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    postsGrid.appendChild(errorEl);
  }
}

/**
 * Update load more button visibility
 */
function updateLoadMoreButton() {
  const container = document.getElementById('load-more-container');
  if (container && CONFIG.enableInfiniteScroll) {
    container.style.display = state.currentPage < state.totalPages ? 'block' : 'none';
  }
}

/**
 * Format date string for display
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for use in other modules
export { loadPage, filterByTag, state };
