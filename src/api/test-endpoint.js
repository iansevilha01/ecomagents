import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Simula resposta do agente
app.post('/webhook/:agentId', (req, res) => {
  const { agentId } = req.params;
  const { userId, prompt } = req.body;

  // Simula processamento
  setTimeout(() => {
    const response = {
      userId,
      agentId,
      response: `Resposta simulada para: ${prompt}`
    };

    // Envia para sua API
    fetch('http://localhost:3000/webhook/' + agentId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    });
  }, 2000);

  res.json({ success: true });
});

app.listen(3001, () => {
  console.log('Test endpoint running on port 3001');
});
