const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

export async function fetchRSS(feedUrl) {
  let response;
  try {
    response = await fetch(`${RSS2JSON_API}${encodeURIComponent(feedUrl)}`, {
      cache: 'no-store'
    });
  } catch (fetchError) {
    console.error(`RSS fetch network error for ${feedUrl}:`, fetchError.message);
    return [];
  }

  if (!response.ok) {
    console.error(`RSS fetch HTTP error for ${feedUrl}: ${response.status}`);
    return [];
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    console.error(`RSS JSON parse error for ${feedUrl}:`, parseError.message);
    return [];
  }

  if (data.status !== 'ok') {
    console.error(`RSS status error for ${feedUrl}: ${data.message || 'Unknown'}`);
    return [];
  }

  return data.items || [];
}

export async function fetchMultipleRSS(feedUrls) {
  const results = await Promise.allSettled(
    feedUrls.map(url => fetchRSS(url))
  );

  const items = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      items.push(...result.value);
    }
  }

  items.sort((a, b) => {
    const dateA = new Date(a.pubDate || 0);
    const dateB = new Date(b.pubDate || 0);
    return dateB - dateA;
  });

  return items;
}

function formatPubDate(pubDate) {
  if (!pubDate) return '';
  const date = new Date(pubDate);
  if (isNaN(date.getTime())) return pubDate;
  return date.toISOString().split('T')[0];
}

function detectSource(url) {
  if (!url) return 'Unknown';
  if (url.includes('qiita.com')) return 'Qiita';
  if (url.includes('zenn.dev')) return 'Zenn';
  return 'Unknown';
}

export function formatRSSItemsForDisplay(items, maxItems = 5) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.slice(0, maxItems).map(item => {
    const description = (item.description || item.content || '').replace(/<[^>]*>/g, '');
    const summary = description.substring(0, 100) + (description.length > 100 ? '...' : '');
    const url = item.link || '';

    return {
      titleJa: item.title || '',
      titleEn: item.title || '',
      date: formatPubDate(item.pubDate),
      summary,
      summaryJa: summary,
      summaryEn: summary,
      descJa: summary,
      descEn: summary,
      type: detectSource(url),
      isNew: true,
      links: [{
        titleJa: item.title || '',
        titleEn: item.title || '',
        source: detectSource(url),
        url
      }]
    };
  });
}
