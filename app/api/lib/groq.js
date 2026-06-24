const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function callGroq(prompt, maxTokens = 4000) {
  await delay(1000);

  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
  } catch (fetchError) {
    throw new Error(`Groq API接続エラー: ${fetchError.message}`);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    let errorBody = '';
    try {
      const errorData = await response.json();
      errorBody = errorData.error?.message || JSON.stringify(errorData);
    } catch {
      errorBody = await response.text().catch(() => 'Unknown error');
    }
    throw new Error(`Groq APIエラー (${response.status}): ${errorBody}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Groq APIレスポンス解析エラー: ${parseError.message}`);
  }

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error(`Groq API不正なレスポンス形式: ${JSON.stringify(data).substring(0, 200)}`);
  }

  return data;
}

export function parseGroqJSON(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('JSONパースエラー: コンテンツが空または不正です');
  }

  let jsonText = content.trim();

  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    const bracketIndex = jsonText.lastIndexOf('}');
    if (bracketIndex > 0) {
      const truncated = jsonText.substring(0, bracketIndex + 1) + ']';
      try {
        return JSON.parse(truncated);
      } catch {
        throw new Error(`JSONパースエラー: ${parseError.message}`);
      }
    }
    throw new Error(`JSONパースエラー: ${parseError.message}`);
  }
}
