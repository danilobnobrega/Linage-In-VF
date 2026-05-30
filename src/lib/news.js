const TAVILY_KEY = import.meta.env.VITE_TAVILY_API_KEY;

export async function fetchNewsForTopic(topic) {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_KEY,
        query: `${topic} mercado financeiro`,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
      }),
    });
    const data = await res.json();
    return data.results
      ?.map(r => `• ${r.title}: ${r.content?.slice(0, 250)}`)
      .join('\n') || '';
  } catch {
    return '';
  }
}
