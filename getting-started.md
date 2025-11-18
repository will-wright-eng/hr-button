# API Endpoint Prototype - Getting Started

## Project Structure

```
api-prototype/
├── app/
│   ├── api/
│   │   └── test-endpoint/
│   │       └── route.ts
│   └── page.tsx
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── getting-started.md
```

## Setup Instructions

### 1. Create a new Next.js project

```bash
npx create-next-app@latest api-prototype --typescript --tailwind
cd api-prototype
```

### 2. Create the directory structure

```bash
mkdir -p app/api/test-endpoint
```

### 3. Add the API route

Create `app/api/test-endpoint/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Replace with your actual API call
    const response = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

### 4. Update the home page

Replace `app/page.tsx` with:

```typescript
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
          // Add your request payload here
          message: 'Test request',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Error: ${res.status}`);
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>API Endpoint Tester</h1>

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
```

### 5. Set up environment variables

Create `.env.local` in the project root:

```
API_KEY=your_api_key_here
```

### 6. Update .gitignore

Make sure `.env.local` is ignored:

```
.env.local
.env.*.local
node_modules/
.next/
```

## Running the Project

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click the "Call API" button to test your endpoint.

## Customization

### Change the API endpoint

Edit the `fetch()` URL in `app/api/test-endpoint/route.ts`:

```typescript
const response = await fetch('https://your-api.com/your-endpoint', {
  // ...
});
```

### Update request payload

Modify the `body` object in `app/page.tsx`:

```typescript
body: JSON.stringify({
  param1: 'value1',
  param2: 'value2',
}),
```

### Add custom headers

Add headers to the route or client-side fetch call:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.API_KEY}`,
  'Custom-Header': 'value',
},
```

## Troubleshooting

- **CORS errors**: If calling an external API from the browser, use the Next.js API route as a proxy (already set up)
- **Missing API key**: Make sure `.env.local` is in the project root and contains `API_KEY=your_key`
- **Port already in use**: Run `npm run dev -- -p 3001` to use a different port
- **Type errors**: Make sure you have TypeScript dependencies: `npm install --save-dev typescript @types/react @types/node`
