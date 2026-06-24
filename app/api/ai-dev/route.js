import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForPrompt } from '../lib/rss';
import { callGroq, parseGroqJSON } from '../lib/groq';

const RSS_FEEDS = [
  'https://qiita.com/tags/cursor/feed',
  'https://qiita.com/tags/githubcopilot/feed',
  'https://qiita.com/tags/claudecode/feed',
  'https://zenn.dev/topics/cursor/feed',
  'https://zenn.dev/topics/githubcopilot/feed',
  'https://github.blog/feed/',
  'https://code.visualstudio.com/feed.xml'
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
この中から、エンジニアが知っておくべきAI駆動開発・Vibe Codingの記事を8件選び、フィルタリング・要約してください。
必ずtype="Qiita"を2件以上含めること（URLにqiita.comが含まれるもの）。
JSONの配列のみを返してください。マークダウン・コードブロック不要。

${combinedText}

返すJSONの形式：
[
  {
    "titleEn": "英語タイトル（記事タイトルを英訳）",
    "titleJa": "日本語タイトル（元の記事タイトル）",
    "type": "IDE または Prompt または Agent または Qiita",
    "isNew": true,
    "date": "YYYY-MM-DD形式の日付",
    "summaryEn": "英語で1文の要約",
    "summaryJa": "日本語で1文の要約",
    "descEn": "英語で2文以内の説明",
    "descJa": "日本語で2文以内の説明",
    "impactEn": "英語でエンジニアへの影響2〜3文",
    "impactJa": "日本語でエンジニアへの影響2〜3文",
    "links": [
      {
        "titleEn": "リンクタイトル（英語）",
        "titleJa": "リンクタイトル（日本語）",
        "source": "Qiita または Zenn または GitHub Blog または その他ソース名",
        "url": "実際のURL"
      }
    ]
  }
]

重要：
- URLは取得した記事の実際のURLを使用すること
- 日付は記事の公開日を使用すること
- 架空の情報を生成せず、取得した記事のみを使用すること`;

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
