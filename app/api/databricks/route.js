import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForPrompt } from '../lib/rss';
import { callGroq, parseGroqJSON } from '../lib/groq';

const RSS_FEEDS = [
  'https://qiita.com/tags/databricks/feed',
  'https://zenn.dev/topics/databricks/feed',
  'https://qiita.com/tags/spark/feed',
  'https://zenn.dev/topics/spark/feed'
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

    const { text: combinedText, items: rssMetadata } = formatRSSItemsForPrompt(items, 3);

    if (!combinedText) {
      return NextResponse.json({
        error: 'RSS_PARSE_ERROR',
        message: 'RSSフィードの解析に失敗しました。'
      }, { status: 500 });
    }

    const prompt = `以下は複数のRSSフィードから取得したDatabricks・Spark関連の最新記事です。
各記事を要約してください。JSONの配列のみを返してください。マークダウン・コードブロック不要。

${combinedText}

返すJSONの形式（各記事に対応するindexを必ず含めること）：
[
  {
    "index": 1,
    "titleEn": "英語タイトル（記事タイトルを英訳）",
    "titleJa": "日本語タイトル（元の記事タイトル）",
    "type": "Release または Feature または Community または Qiita",
    "isNew": true,
    "summaryEn": "英語で1文の要約",
    "summaryJa": "日本語で1文の要約",
    "descEn": "英語で1文の説明",
    "descJa": "日本語で1文の説明",
    "links": [
      {
        "titleEn": "リンクタイトル（英語）",
        "titleJa": "リンクタイトル（日本語）",
        "source": "Qiita または Zenn"
      }
    ]
  }
]

【絶対厳守】
- indexは記事番号[1], [2], [3]に対応する数字を使用すること
- 提供された記事のみを要約すること。架空の記事・情報を絶対に生成しないこと`;

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const aiData = parseGroqJSON(content);

    if (!Array.isArray(aiData)) {
      return NextResponse.json({
        error: 'PARSE_ERROR',
        message: 'AIレスポンスの解析に失敗しました。再取得してください。'
      }, { status: 500 });
    }

    const data = aiData.map(item => {
      const meta = rssMetadata.find(m => m.index === item.index) || rssMetadata[0];
      return {
        ...item,
        date: meta?.date || '',
        links: (item.links || []).map(link => ({
          ...link,
          url: meta?.url || ''
        }))
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Databricks API error:', error);

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
