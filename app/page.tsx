'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleButtonClick = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/test-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Say hello and tell me a fun fact about AI in one sentence.',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Error: ${res.status}`);
        if (data.details) {
          setError(`${data.error}\n${JSON.stringify(data.details, null, 2)}`);
        }
      } else {
        // Display the response text prominently, with full response available
        setResponse(data.response || JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Gemini API Tester</h1>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Test the Gemini API text completion endpoint
      </p>

      <button
        onClick={handleButtonClick}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Loading...' : 'Call API'}
      </button>

      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <pre style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
          {response}
        </pre>
      )}
    </div>
  );
}

