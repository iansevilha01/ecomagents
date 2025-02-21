import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Store active socket connections
const activeConnections = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('register', (userId) => {
    if (userId) {
      activeConnections.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeConnections.entries()) {
      if (socketId === socket.id) {
        activeConnections.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Webhook endpoint for receiving responses from N8N
app.post('/webhook/n8n-response', async (req, res) => {
  console.log('Received webhook from N8N:', req.body);
  
  const { agentId, userId, prompt, response } = req.body;

  if (!agentId || !userId || !response) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      received: { agentId, userId, response }
    });
  }

  try {
    // Save to Supabase
    const { error: dbError } = await supabase
      .from('agent_responses')
      .insert({
        agent_id: agentId,
        user_id: userId,
        prompt: prompt || '',
        response: response
      });

    if (dbError) {
      console.error('Supabase error:', dbError);
      throw dbError;
    }

    // Send to connected client
    const socketId = activeConnections.get(userId);
    if (socketId) {
      io.to(socketId).emit('agent-response', {
        agentId,
        response
      });
      console.log('Sent response to socket:', socketId);
    } else {
      console.log('No active socket connection found for user:', userId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing N8N response:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});