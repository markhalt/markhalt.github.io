// src/js/main.js

// Utility to fetch JSON files from articles
async function fetchArticles() {
  // For demo, manually list articles. For real automation, use a build step or GitHub Action to generate this list.
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
    return cardTemplate
      .replace('{{image}}', `content/articles/${article.slug}/` + (article.images[0] || ''))
      .replace('{{title}}', article.title)
      .replace('{{summary}}', article.summary)
      .replace('{{slug}}', article.slug);
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
    <h1>${article.title}</h1>
    <p><em>${article.date}</em></p>
    ${article.images.map(img => `<img src="../../content/articles/${slug}/${img}" alt="${article.title}" />`).join('')}
    ${article.body}
  `;
}

// Router: Load correct page
document.addEventListener('DOMContentLoaded', async () => {
  // Header & Footer
  await loadComponent('header', 'src/components/Header/Header.html', 'src/components/Header/Header.css');
  await loadComponent('footer', 'src/components/Footer/Footer.html', 'src/components/Footer/Footer.css');

  // Home or Article page
  if (document.getElementById('articles-list')) {
    await renderHomePage();
  }
  if (document.getElementById('article-content')) {
    await renderArticlePage();
  }
});
