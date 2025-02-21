import { supabase } from '../lib/supabase';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function sendToAgent(prompt: string, agentId: string) {
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        userId: user.id,
        prompt,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send request to n8n');
    }

    return { success: true, message: 'Request sent to n8n successfully' };
  } catch (error) {
    console.error('Error sending webhook to n8n:', error);
    throw error;
  }
}
