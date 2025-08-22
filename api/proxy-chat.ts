import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userQuery } = req.body;
    
    console.log('🚀 Proxying request to Supabase:', userQuery);
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/process-user-query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userQuery }),
    });

    console.log('📦 Supabase response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Supabase function error: ${response.status}`);
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Vercel buffering
    
    if (!response.body) {
      throw new Error('No response body');
    }

    console.log('📺 Starting stream proxy...');
    
    const reader = response.body.getReader();
    let chunkCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream complete! Total chunks:', chunkCount);
          res.end();
          break;
        }
        
        chunkCount++;
        const chunk = new TextDecoder().decode(value);
        console.log(`📝 Proxying chunk ${chunkCount}:`, chunk.substring(0, 100));
        
        res.write(chunk);
      }
    } finally {
      reader.releaseLock();
    }
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}