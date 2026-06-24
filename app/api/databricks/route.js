import { NextResponse } from 'next/server';
import { fetchMultipleRSS, formatRSSItemsForPrompt } from '../lib/rss';
import { callGroq, parseGroqJSON } from '../lib/groq';

const RSS_FEEDS = [
  'https://qiita.com/tags/databricks/feed',
  'https://zenn.dev/topics/databricks/feed',
  'https://www.databricks.com/feed',
  'https://medium.com/feed/tag/databricks',
  'https://dev.classmethod.jp/tags/databricks/feed/'
];

export async function GET() {
  try {
    const items = await fetchMultipleRSS(RSS_FEEDS);

    if (items.length === 0) {
      return NextResponse.json({ error: 'No RSS items fetched' }, { status: 500 });
    }

    const combinedText = formatRSSItemsForPrompt(items);

    const prompt = `以下は複数のRSSフィードから取得したDatabricks関連の最新記事です。
この中から、データエンジニアが知っておくべきDatabricks関連の記事を8件選び、フィルタリング・要約してください。
必ずtype="Qiita"を2件以上含めること（URLにqiita.comが含まれるもの）。
JSONの配列のみを返してください。マークダウン・コードブロック不要。

${combinedText}

返すJSONの形式：
[
  {
    "titleEn": "英語タイトル（記事タイトルを英訳）",
    "titleJa": "日本語タイトル（元の記事タイトル）",
    "type": "Release または Feature または Community または Qiita",
    "isNew": true,
    "date": "YYYY-MM-DD形式の日付",
    "summaryEn": "英語で1〜2文の要約",
    "summaryJa": "日本語で1〜2文の要約",
    "descEn": "英語で2文以内の説明",
    "descJa": "日本語で2文以内の説明",
    "impactEn": "英語でデータエンジニアへの影響2〜3文",
    "impactJa": "日本語でデータエンジニアへの影響2〜3文",
    "links": [
      {
        "titleEn": "リンクタイトル（英語）",
        "titleJa": "リンクタイトル（日本語）",
        "source": "Databricks Blog または Qiita または Zenn または その他ソース名",
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
      throw new Error('Invalid response format: expected array');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Databricks API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
