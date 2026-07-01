// CMS契約後に enabled を true にし、各値を本番情報へ差し替えてください。
window.KOMORI_CMS_CONFIG = {
  enabled: false,
  provider: 'microcms',
  serviceDomain: 'YOUR_SERVICE_DOMAIN',
  apiKey: 'YOUR_READ_ONLY_API_KEY',
  endpoints: {
    news: 'news',
    blog: 'nursing-blog'
  },
  limit: {
    news: 6,
    blog: 12
  }
};
