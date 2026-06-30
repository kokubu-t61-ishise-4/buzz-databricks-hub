import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForPrompt } from '../lib/rss';
import { callGroq, parseGroqJSON } from '../lib/groq';

const RSS_FEEDS = [
  'https://qiita.com/tags/cursor/feed',
  'https://qiita.com/tags/githubcopilot/feed',
  'https://qiita.com/tags/claudecode/feed',
  'https://qiita.com/tags/vscode/feed',
  'https://zenn.dev/topics/cursor/feed',
  'https://zenn.dev/topics/githubcopilot/feed',
  'https://zenn.dev/topics/vscode/feed'
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

    const combinedText = formatRSSItemsForPrompt(items);

    if (!combinedText) {
      return NextResponse.json({
        error: 'RSS_PARSE_ERROR',
        message: 'RSSフィードの解析に失敗しました。'
      }, { status: 500 });
    }

    const prompt = `以下は複数のRSSフィードから取得したAI駆動開発関連の最新記事です。
この中から、エンジニアが知っておくべきAI駆動開発・Vibe Codingの記事を最大3件選び、要約してください。
JSONの配列のみを返してください。マークダウン・コードブロック不要。

${combinedText}

返すJSONの形式：
[
  {
    "titleEn": "英語タイトル（記事タイトルを英訳）",
    "titleJa": "日本語タイトル（元の記事タイトル）",
    "type": "IDE または Prompt または Agent または Qiita",
    "isNew": true,
    "date": "YYYY-MM-DD形式の日付（元記事のDateから取得）",
    "summaryEn": "英語で1文の要約",
    "summaryJa": "日本語で1文の要約",
    "descEn": "英語で1文の説明",
    "descJa": "日本語で1文の説明",
    "links": [
      {
        "titleEn": "リンクタイトル（英語）",
        "titleJa": "リンクタイトル（日本語）",
        "source": "Qiita または Zenn",
        "url": "元記事のURL"
      }
    ]
  }
]

【絶対厳守】
- dateは元記事のDateフィールド（pubDate）をYYYY-MM-DD形式に変換すること。架空の日付を生成しないこと
- URLは元記事のURLをそのまま使用すること
- 取得した記事の情報のみを使用すること。架空の記事・情報を絶対に生成しないこと
- 提供された記事データに存在しない情報を追加しないこと`;

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const data = parseGroqJSON(content);

    if (!Array.isArray(data)) {
      return NextResponse.json({
        error: 'PARSE_ERROR',
        message: 'AIレスポンスの解析に失敗しました。再取得してください。'
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Dev API error:', error);

    if (error.message === 'RATE_LIMIT') {
      return NextResponse.json({
        error: 'RATE_LIMIT',
        message: 'APIの利用制限に達しました。しばらく待ってから再取得してください。'
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'SERVER_ERROR',
      message: error.message || 'サーバーエラーが発生しました。'
    }, { status: 500 });
  }
}
