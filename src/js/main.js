// src/js/main.js

// Utility to fetch JSON files from articles
async function fetchArticles() {
  // Manually list articles for now
  const articles = [
    'content/articles/article-01/article-01.json',
    'content/articles/article-02/article-02.json'
  ];
  return Promise.all(articles.map(path => fetch(path).then(res => res.json())));
}

// Load and inject header/footer
async function loadComponent(id, htmlPath, cssPath) {
  const html = await fetch(htmlPath).then(res => res.text());
  document.getElementById(id).innerHTML = html;
  if (cssPath) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
  }
}

// Render homepage articles
async function renderHomePage() {
  const articles = await fetchArticles();
  const cardTemplate = await fetch('src/components/ArticleCard/ArticleCard.html').then(res => res.text());
  const list = document.getElementById('articles-list');
  list.innerHTML = articles.map(article => {
    // Replace ALL placeholders globally
    return cardTemplate
      .replace(/{{image}}/g, `content/articles/${article.slug}/` + (article.images[0] || ''))
      .replace(/{{title}}/g, article.title)
      .replace(/{{summary}}/g, article.summary)
      .replace(/{{slug}}/g, article.slug);
  }).join('');
}

// Render article page
async function renderArticlePage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('article');
  if (!slug) return;
  const article = await fetch(`../../content/articles/${slug}/${slug}.json`).then(res => res.json());
  const container = document.getElementById('article-content');
  container.innerHTML = `
    <div class="split-article-full">
      <div class="split-article-full__image-side">
        ${article.images.map(img => `
          <img 
            src="../../content/articles/${slug}/${img}" 
            alt="${article.title}" 
            loading="lazy"
            class="split-article-full__img"
          />`).join('')}
      </div>
      <div class="split-article-full__text-side">
        <h1>${article.title}</h1>
        <p><em>${article.date}</em></p>
        ${article.body}
      </div>
    </div>
  `;
}

// Router: Load correct page
document.addEventListener('DOMContentLoaded', async () => {
  // Header & Footer
  await loadComponent('header', 'src/components/Header/Header.html', 'src/components/Header/Header.css');
  await loadComponent('footer', 'src/components/Footer/Footer.html', 'src/components/Footer/Footer.css');
  // Home or Article page
  if (document.getElementById('main-content')) {
    // Load HomePage HTML into main-content
    const homeHtml = await fetch('src/pages/HomePage/index.html').then(res => res.text());
    document.getElementById('main-content').innerHTML = homeHtml;
    // Load HomePage CSS
    const homeCss = document.createElement('link');
    homeCss.rel = 'stylesheet';
    homeCss.href = 'src/pages/HomePage/home.css';
    document.head.appendChild(homeCss);
    // Render articles
    if (document.getElementById('articles-list')) {
      await renderHomePage();
    }
  }
  // If on article page, load ArticlePage content
  if (window.location.pathname.endsWith('ArticlePage/index.html')) {
    // Load ArticlePage CSS
    const articleCss = document.createElement('link');
    articleCss.rel = 'stylesheet';
    articleCss.href = '../../src/pages/ArticlePage/article.css';
    document.head.appendChild(articleCss);
    // Render article
    if (document.getElementById('article-content')) {
      await renderArticlePage();
    }
  }
});
