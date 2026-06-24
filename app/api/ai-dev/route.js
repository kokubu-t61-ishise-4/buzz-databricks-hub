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
      max_tokens: 8000,
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
    const currentYear = new Date().getFullYear();
    const queries = [
      `AI driven development vibe coding cursor windsurf ${currentYear}`,
      `AI駆動開発 Cursor GitHub Copilot プロンプトエンジニアリング ${currentYear}`
    ];

    const [result1, result2] = await Promise.all(queries.map(q => searchTavily(q)));

    const allResults = [...(result1.results || []), ...(result2.results || [])];
    let combinedText = allResults
      .map(r => `Title: ${r.title}\nContent: ${r.content}`)
      .join('\n\n');

    if (combinedText.length > 3000) {
      combinedText = combinedText.substring(0, 3000);
    }

    const prompt = `以下はAI駆動開発に関するWeb検索の生データです。
エンジニアが知っておくべきAI駆動開発・Vibe Codingの最新情報を8件抽出してください。
必ずtype="Qiita"を2件以上含めること。
JSONの配列のみを返してください。マークダウン・コードブロック不要。
各フィールドは簡潔に。summaryは1文、descは2文以内。

${combinedText}

返すJSONの形式：
[
  {
    "titleEn": "英語タイトル",
    "titleJa": "日本語タイトル",
    "type": "IDE または Prompt または Agent または Qiita",
    "isNew": true または false,
    "date": "2025-XX-XX",
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

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (parseError) {
      const bracketIndex = jsonText.lastIndexOf('}');
      if (bracketIndex > 0) {
        const truncated = jsonText.substring(0, bracketIndex + 1) + ']';
        try {
          data = JSON.parse(truncated);
        } catch {
          throw new Error(`JSON parse error: ${parseError.message}`);
        }
      } else {
        throw new Error(`JSON parse error: ${parseError.message}`);
      }
    }

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Dev API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
