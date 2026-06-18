import { NextResponse } from 'next/server';

async function searchTavily(query) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: 5,
      search_depth: 'basic'
    })
  });
  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.status}`);
  }
  return response.json();
}

async function callGroq(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }
  return response.json();
}

export async function GET() {
  try {
    const queries = [
      'IT buzzwords trending 2025 2026 tech community site:techcrunch.com OR site:theverge.com OR site:zenn.dev',
      'ITバズワード トレンド 2025 エンジニア site:zenn.dev OR site:qiita.com'
    ];

    const [result1, result2] = await Promise.all(queries.map(q => searchTavily(q)));

    const allResults = [...(result1.results || []), ...(result2.results || [])];
    let combinedText = allResults
      .map(r => `Title: ${r.title}\nContent: ${r.content}`)
      .join('\n\n');

    if (combinedText.length > 3000) {
      combinedText = combinedText.substring(0, 3000);
    }

    const prompt = `以下はWeb検索で取得した最新のIT技術トレンド情報です。
この情報をもとに、エンジニアが知っておくべきITバズワードを8個抽出し、
必ずJSONの配列のみを返してください。マークダウン記法・コードブロック不要。

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
        "url": "https://..."
      }
    ]
  }
]`;

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;

    let jsonText = content.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    }

    const data = JSON.parse(jsonText);
    return NextResponse.json(data);
  } catch (error) {
    console.error('BuzzRadar API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
