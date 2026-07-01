(function () {
  'use strict';

  var categoryClassMap = {
    patient: 'bg-sakura-soft text-sakura-dark',
    medical: 'bg-leaf-soft text-leaf-dark',
    recruit: 'bg-amber-100 text-amber-700'
  };

  function formatDate(value, separator) {
    if (!value) return '';
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return [y, m, d].join(separator || '.');
  }

  function formatJapaneseDate(value) {
    if (!value) return '';
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
  }

  function normalizeMicrocmsList(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.contents)) return payload.contents;
    return [];
  }

  function getConfig() {
    var config = window.KOMORI_CMS_CONFIG;
    if (!config || !config.enabled) return null;
    if (!config.serviceDomain || !config.apiKey || !config.endpoints) return null;
    return config;
  }

  async function fetchMicrocms(endpoint, limit) {
    var config = getConfig();
    if (!config) return [];
    var base = 'https://' + config.serviceDomain + '.microcms.io/api/v1/';
    var url = base + endpoint + '?limit=' + encodeURIComponent(limit || 10) + '&orders=-date';
    var response = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': config.apiKey }
    });
    if (!response.ok) throw new Error('CMS fetch failed: ' + response.status);
    return normalizeMicrocmsList(await response.json());
  }

  function createNewsItem(item) {
    var row = document.createElement('div');
    var category = item.category || 'patient';
    var label = item.categoryLabel || item.category_label || 'お知らせ';
    row.className = 'news-item py-2.5 flex flex-col sm:flex-row sm:items-center gap-1.5';
    row.dataset.cat = category;

    var date = document.createElement('span');
    date.className = 'text-xs text-cozy-gray sm:w-24 shrink-0';
    date.textContent = formatDate(item.date || item.publishedAt, '.');

    var badge = document.createElement('span');
    badge.className = (categoryClassMap[category] || 'bg-gray-100 text-cozy-gray') + ' text-[10px] px-2 py-0.5 rounded font-bold self-start shrink-0';
    badge.textContent = label;

    var title;
    if (item.linkType === 'url' && item.linkUrl) {
      title = document.createElement('a');
      title.href = item.linkUrl;
      title.target = '_blank';
      title.rel = 'noopener';
    } else if (item.linkType === 'page' && item.pageId) {
      title = document.createElement('a');
      title.href = '#';
      title.addEventListener('click', function (event) {
        event.preventDefault();
        if (typeof window.showPage === 'function') window.showPage(item.pageId);
      });
    } else {
      title = document.createElement('span');
    }
    title.className = 'hover:text-leaf-dark flex-grow text-sm';
    title.textContent = item.title || '';

    row.append(date, badge, title);
    return row;
  }

  function renderNews(items) {
    var list = document.getElementById('news-list');
    if (!list || !items.length) return;
    list.innerHTML = '';
    items.forEach(function (item) { list.appendChild(createNewsItem(item)); });
    if (typeof window.switchNewsTab === 'function') window.switchNewsTab('all');
  }

  function buildBlogData(items) {
    var data = {};
    items.forEach(function (item, index) {
      var month = item.month || (item.date ? String(item.date).slice(0, 7) : '');
      if (!month) return;
      data[month] = {
        month: item.displayMonth || item.display_month || month,
        headerTitle: item.headerTitle || item.title || '看護部長ブログ',
        date: formatJapaneseDate(item.date || item.publishedAt),
        title: item.title || '',
        volume: item.volume || 'Vol.' + String(items.length - index).padStart(2, '0'),
        articles: item.sections || item.articles || []
      };
    });
    return data;
  }

  function renderBlogLists(items) {
    var entryList = document.getElementById('blog-entry-list');
    var archiveList = document.getElementById('archive-list');
    if (!entryList || !archiveList || !items.length) return;

    var grouped = {};
    items.forEach(function (item, index) {
      var month = item.month || (item.date ? String(item.date).slice(0, 7) : '');
      if (!month) return;
      var year = month.slice(0, 4);
      grouped[year] = grouped[year] || [];
      grouped[year].push(Object.assign({ _month: month, _index: index }, item));
    });

    entryList.innerHTML = '';
    Object.keys(grouped).sort().reverse().forEach(function (year) {
      var wrap = document.createElement('div');
      wrap.dataset.year = year;
      wrap.innerHTML = '<h5 class="font-bold text-sm mb-2 text-cozy-text border-b border-gray-200 pb-1">' + year + '年</h5>';
      var ul = document.createElement('ul');
      ul.className = 'space-y-0 text-sm';
      grouped[year].forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'blog-entry border-b border-dotted border-gray-100';
        var button = document.createElement('button');
        button.className = 'w-full text-left flex items-center gap-2 py-2.5 hover:bg-leaf-pale/40 transition-colors px-1 rounded';
        button.onclick = function () { window.showBlogArticle(item._month); };
        button.innerHTML = '<span class="text-cozy-gray text-xs whitespace-nowrap w-14 shrink-0"></span><span class="text-cozy-gray text-xs whitespace-nowrap w-8 shrink-0"></span><span class="text-sakura-dark text-xs leading-relaxed hover:underline"></span><i class="fa-solid fa-chevron-right text-xs text-cozy-gray ml-auto shrink-0"></i>';
        button.children[0].textContent = item.volume || 'Vol.' + String(items.length - item._index).padStart(2, '0');
        button.children[1].textContent = String(Number(item._month.slice(5, 7))) + '月';
        button.children[2].textContent = item.title || item.headerTitle || item.displayMonth || item._month;
        li.appendChild(button);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      entryList.appendChild(wrap);
    });

    archiveList.innerHTML = '';
    items.forEach(function (item) {
      var month = item.month || (item.date ? String(item.date).slice(0, 7) : '');
      if (!month) return;
      var li = document.createElement('li');
      var button = document.createElement('button');
      button.dataset.month = month;
      button.className = 'archive-btn w-full text-left flex items-center gap-2 px-4 py-2.5 hover:bg-leaf-pale/60 transition-colors text-cozy-text';
      button.onclick = function () { window.showBlogArticle(month); };
      button.innerHTML = '<span class="text-leaf-dark text-xs font-bold">■</span> ' + (item.displayMonth || item.display_month || month);
      li.appendChild(button);
      archiveList.appendChild(li);
    });
  }

  function renderBlogArticle(data, month) {
    var item = data[month];
    if (!item) return;
    document.getElementById('blog-toc-view').classList.add('hidden');
    document.getElementById('blog-article-view').classList.remove('hidden');
    document.getElementById('blog-article-month').textContent = item.month;
    document.getElementById('blog-article-header').textContent = item.headerTitle;
    document.getElementById('blog-article-date').textContent = item.date;

    var bodyEl = document.getElementById('blog-article-body');
    bodyEl.innerHTML = '';
    item.articles.forEach(function (section, index) {
      var wrap = document.createElement('div');
      wrap.className = 'space-y-3';
      var title = document.createElement('div');
      title.className = 'flex items-start gap-2 text-leaf-dark font-bold';
      title.innerHTML = '<i class="fa-solid fa-hand-point-right text-leaf-accent mt-0.5 shrink-0"></i><span class="text-base"></span>';
      title.querySelector('span').textContent = (section.number || String(index + 1) + '.') + '　' + (section.title || item.title);
      wrap.appendChild(title);

      (section.body || []).forEach(function (text) {
        var p = document.createElement('p');
        p.className = 'text-sm text-cozy-gray leading-relaxed pl-6';
        p.textContent = text;
        wrap.appendChild(p);
      });

      if (section.imageUrl || section.image_url || section.caption) {
        var photo = document.createElement('div');
        photo.className = 'pl-6 space-y-2';
        var imageUrl = section.imageUrl || section.image_url;
        if (imageUrl) {
          var img = document.createElement('img');
          img.src = imageUrl;
          img.alt = section.imageAlt || section.image_alt || section.caption || item.title;
          img.className = 'mx-auto max-w-full rounded-lg border border-leaf-soft';
          photo.appendChild(img);
        }
        if (section.caption) {
          var cap = document.createElement('div');
          cap.className = 'text-xs text-cozy-gray bg-gray-50 border border-gray-200 rounded p-2 text-center';
          cap.textContent = section.caption;
          photo.appendChild(cap);
        }
        wrap.appendChild(photo);
      }
      bodyEl.appendChild(wrap);
    });

    document.querySelectorAll('.archive-btn').forEach(function (btn) {
      btn.classList.toggle('bg-leaf-pale', btn.dataset.month === month);
      btn.classList.toggle('font-bold', btn.dataset.month === month);
    });
    document.getElementById('nursing-blog').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function initCms() {
    var config = getConfig();
    if (!config) return;
    try {
      var news = await fetchMicrocms(config.endpoints.news, (config.limit && config.limit.news) || 6);
      renderNews(news);
    } catch (error) {
      console.warn('[Komori CMS] お知らせの取得に失敗しました。固定表示を使用します。', error);
    }

    try {
      var blogItems = await fetchMicrocms(config.endpoints.blog, (config.limit && config.limit.blog) || 12);
      if (!blogItems.length) return;
      var cmsBlogData = buildBlogData(blogItems);
      renderBlogLists(blogItems);
      window.showBlogArticle = function (month) { renderBlogArticle(cmsBlogData, month); };
      window.filterBlogByMonth = function (month) {
        if (month) window.showBlogArticle(month);
        else if (typeof window.backToBlogIndex === 'function') window.backToBlogIndex();
      };
    } catch (error) {
      console.warn('[Komori CMS] ブログの取得に失敗しました。固定表示を使用します。', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCms);
  } else {
    initCms();
  }
})();
