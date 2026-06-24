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
  return items;
}

export function formatRSSItemsForPrompt(items, maxItems = 5, maxLength = 3000) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

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
