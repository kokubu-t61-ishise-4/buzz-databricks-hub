import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForDisplay } from '../lib/rss';

const RSS_FEEDS = [
  'https://zenn.dev/feed',
  'https://qiita.com/popular-items/feed',
  'https://qiita.com/tags/tech/feed',
  'https://zenn.dev/topics/frontend/feed',
  'https://zenn.dev/topics/backend/feed'
];

export async function GET() {
  try {
    const items = await fetchMultipleRSS(RSS_FEEDS);

    if (!items || items.length === 0) {
      return NextResponse.json({
        error: 'RSS_FETCH_ERROR',
        message: 'RSSフィードから記事を取得できませんでした。しばらく待ってから再取得してください。'
      }, { status: 503 });
    }

    const data = formatRSSItemsForDisplay(items, 5);

    return NextResponse.json(data);
  } catch (error) {
    console.error('BuzzRadar API error:', error);

    return NextResponse.json({
      error: 'SERVER_ERROR',
      message: error.message || 'サーバーエラーが発生しました。'
    }, { status: 500 });
  }
}
