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

function getJSTDate(date = new Date()) {
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstDate = new Date(date.getTime() + jstOffset);
  return jstDate.toISOString().split('T')[0];
}

function filterByDate(items, daysBack) {
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffset);
  const targetDate = new Date(jstNow);
  targetDate.setDate(targetDate.getDate() - daysBack);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  return items.filter(item => {
    if (!item.pubDate) return false;
    const itemDate = new Date(item.pubDate);
    const itemJST = new Date(itemDate.getTime() + jstOffset);
    const itemDateStr = itemJST.toISOString().split('T')[0];
    return itemDateStr >= targetDateStr;
  });
}

export function formatRSSItemsForPrompt(items, maxItems = 5, maxLength = 2000) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  let filteredItems = filterByDate(items, 0);

  if (filteredItems.length === 0) {
    filteredItems = filterByDate(items, 1);
  }

  if (filteredItems.length === 0) {
    filteredItems = filterByDate(items, 3);
  }

  if (filteredItems.length === 0) {
    filteredItems = items.slice(0, maxItems);
  }

  let text = filteredItems
    .slice(0, maxItems)
    .map(item => {
      const title = item.title || '';
      const content = (item.description || item.content || '').replace(/<[^>]*>/g, '').substring(0, 150);
      const link = item.link || '';
      const date = item.pubDate || '';
      return `Title: ${title}\nDate: ${date}\nURL: ${link}\nContent: ${content}`;
    })
    .join('\n\n---\n\n');

  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
  }
  return text;
}
