import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForPrompt } from '../lib/rss';
import { callGroq, parseGroqJSON } from '../lib/groq';

const RSS_FEEDS = [
  'https://www.publickey1.jp/atom.xml',
  'https://hnrss.org/frontpage',
  'https://zenn.dev/feed',
  'https://qiita.com/popular-items/feed',
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://gihyo.jp/dev/feed/rss2'
];

export async function GET() {
  try {
    const items = await fetchMultipleRSS(RSS_FEEDS);

    if (items.length === 0) {
      return NextResponse.json({ error: 'No RSS items fetched' }, { status: 500 });
    }

    const combinedText = formatRSSItemsForPrompt(items);

    const prompt = `以下は複数のRSSフィードから取得したIT技術関連の最新記事です。
この中から、エンジニアが知っておくべきITバズワード・トレンド用語を8個抽出してください。
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
    "summaryEn": "英語で1〜2文の要約",
    "summaryJa": "日本語で1〜2文の要約",
    "definitionEn": "英語で3〜4文の詳細定義",
    "definitionJa": "日本語で3〜4文の詳細定義",
    "backgroundEn": "英語で登場背景2〜3文",
    "backgroundJa": "日本語で登場背景2〜3文",
    "articles": [
      {
        "titleEn": "記事タイトル（英語）",
        "titleJa": "記事タイトル（日本語訳）",
        "source": "ソース名",
        "url": "実際のURL"
      }
    ]
  }
]

重要：
- URLは取得した記事の実際のURLを使用すること
- 記事から実際に言及されているバズワード・用語を抽出すること
- 架空の情報を生成せず、取得した記事に基づいて抽出すること`;

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const data = parseGroqJSON(content);

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array');
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
