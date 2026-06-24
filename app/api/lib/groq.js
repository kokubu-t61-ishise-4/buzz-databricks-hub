const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function callGroq(prompt, maxTokens = 4000) {
  await delay(1000);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    throw new Error(`Groq API error: ${response.status}`);
  }
  return response.json();
}

export function parseGroqJSON(content) {
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
        throw new Error(`JSON parse error: ${parseError.message}`);
      }
    }
    throw new Error(`JSON parse error: ${parseError.message}`);
  }
}
