// このファイルを cms-config.js にコピーして、CMS契約後の値に差し替えてください。
// ブラウザから直接CMS APIを読む場合、APIキーは「読み取り専用」にし、許可ドメインを制限してください。
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
