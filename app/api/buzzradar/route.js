import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForPrompt } from '../lib/rss';
import { callGroq, parseGroqJSON } from '../lib/groq';

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

    const combinedText = formatRSSItemsForPrompt(items);

    if (!combinedText) {
      return NextResponse.json({
        error: 'RSS_PARSE_ERROR',
        message: 'RSSフィードの解析に失敗しました。'
      }, { status: 500 });
    }

    const prompt = `以下は複数のRSSフィードから取得したIT技術関連の最新記事です。
この中から、エンジニアが知っておくべきITバズワード・トレンド用語を最大3個抽出してください。
JSONの配列のみを返してください。マークダウン・コードブロック不要。

${combinedText}

返すJSONの形式：
[
  {
    "termEn": "英語の用語名",
    "termJa": "日本語訳または読み仮名",
    "category": "AI/ML または Infrastructure または Data または Security",
    "region": "overseas または japan または both",
    "heat": 1から5の整数（注目度）,
    "summaryEn": "英語で1文の要約",
    "summaryJa": "日本語で1文の要約",
    "definitionEn": "英語で1〜2文の詳細定義",
    "definitionJa": "日本語で1〜2文の詳細定義",
    "articles": [
      {
        "titleEn": "記事タイトル（英語）",
        "titleJa": "記事タイトル（日本語）",
        "source": "Qiita または Zenn",
        "url": "元記事のURL"
      }
    ]
  }
]

【絶対厳守】
- URLは元記事のURLをそのまま使用すること
- 記事から実際に言及されているバズワード・用語のみを抽出すること
- 取得した記事の情報のみを使用すること。架空のバズワード・情報を絶対に生成しないこと
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
    console.error('BuzzRadar API error:', error);

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
