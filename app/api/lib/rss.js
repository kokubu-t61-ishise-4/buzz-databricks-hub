const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

export async function fetchRSS(feedUrl) {
  const response = await fetch(`${RSS2JSON_API}${encodeURIComponent(feedUrl)}`, {
    next: { revalidate: 3600 }
  });
  if (!response.ok) {
    throw new Error(`RSS fetch error: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'ok') {
    throw new Error(`RSS parse error: ${data.message || 'Unknown error'}`);
  }
  return data.items || [];
}

export async function fetchMultipleRSS(feedUrls) {
  const results = await Promise.allSettled(
    feedUrls.map(url => fetchRSS(url))
  );

  const items = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    }
  }
  return items;
}

export function formatRSSItemsForPrompt(items, maxItems = 5, maxLength = 3000) {
  let text = items
    .slice(0, maxItems)
    .map(item => {
      const title = item.title || '';
      const content = (item.description || item.content || '').replace(/<[^>]*>/g, '').substring(0, 300);
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
