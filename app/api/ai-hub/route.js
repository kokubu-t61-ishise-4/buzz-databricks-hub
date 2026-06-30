import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForDisplay } from '../lib/rss';

const RSS_FEEDS = [
  'https://qiita.com/tags/llm/feed',
  'https://qiita.com/tags/ai/feed',
  'https://qiita.com/tags/claude/feed',
  'https://qiita.com/tags/chatgpt/feed',
  'https://zenn.dev/topics/llm/feed',
  'https://zenn.dev/topics/ai/feed',
  'https://zenn.dev/topics/claude/feed'
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
    console.error('AI Hub API error:', error);

    return NextResponse.json({
      error: 'SERVER_ERROR',
      message: error.message || 'サーバーエラーが発生しました。'
    }, { status: 500 });
  }
}
