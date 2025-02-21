import React, { FC, useState, useEffect, useCallback } from 'react';
import { X, Copy, RotateCw, ThumbsUp, ThumbsDown, Clock, AlertCircle } from 'lucide-react';
import { Agent } from '../types';
import { sendToAgent } from '../services/webhookService';
import { useAuthStore } from '../stores/authStore';
import { useUsageStore } from '../stores/usageStore';
import { supabase } from '../lib/supabase';
import SocketService from '../services/socketService';

interface AgentDialogProps {
  agent: Agent;
  onClose: () => void;
}

interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  created_at: string;
}

const AgentDialog: FC<AgentDialogProps> = ({ agent, onClose }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'history' | 'feedback'>('output');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const { recordUsage, checkCredits } = useUsageStore();

  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [user, agent.id]);

  useEffect(() => {
    if (user) {
      const socketService = SocketService.getInstance();
      socketService.registerUser(user.id);
      
      socketService.onAgentResponse(agent.id, (data) => {
        setOutput(data.response);
        setIsLoading(false);
        loadHistory();
        
        recordUsage({
          user_id: user.id,
          agent_id: agent.id,
          prompt: input,
          response: data.response,
          tokens_used: estimateTokens(input, data.response)
        });
      });

      loadHistory();

      return () => {
        socketService.removeAgentResponseHandler(agent.id);
      };
    }
  }, [user, agent.id, input, recordUsage, loadHistory]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || !user) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const hasCredits = await checkCredits(user.id);
      if (!hasCredits) {
        setError('Você atingiu seu limite de créditos. Faça upgrade do seu plano.');
        setIsLoading(false);
        return;
      }
      
      await sendToAgent(input, agent.id);
      // Response will be handled by WebSocket connection
    } catch (error) {
      setError('Erro ao processar sua solicitação. Tente novamente.');
      setIsLoading(false);
      console.error('Error:', error);
    }
  };

  const submitFeedback = async () => {
    if (!rating || !user) return;

    try {
      const { error } = await supabase
        .from('agent_feedback')
        .insert({
          user_id: user.id,
          agent_id: agent.id,
          rating,
          comment: feedback,
        });

      if (error) throw error;

      setFeedback('');
      setRating(null);
      alert('Feedback enviado com sucesso!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Erro ao enviar feedback. Tente novamente.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const estimateTokens = (prompt: string, response: string): number => {
    // This is a very simple estimation. Adjust according to your needs.
    return Math.ceil((prompt.length + response.length) / 4);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-2xl">{agent.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <p className="text-sm text-gray-600">{agent.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('output')}
            className={`px-4 py-2 ${
              activeTab === 'output' 
                ? 'border-b-2 border-[#4A90E2] text-[#4A90E2]' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Resposta
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 ${
              activeTab === 'history' 
                ? 'border-b-2 border-[#4A90E2] text-[#4A90E2]' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 ${
              activeTab === 'feedback' 
                ? 'border-b-2 border-[#4A90E2] text-[#4A90E2]' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Feedback
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'output' && (
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
              />
              
              {error && (
                <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className="w-full px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A80D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RotateCw className="w-5 h-5 animate-spin mr-2" />
                    <span>Gerando resposta...</span>
                  </div>
                ) : (
                  'Gerar'
                )}
              </button>

              {output && (
                <div className="bg-gray-50 p-4 rounded-lg relative">
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <pre className="whitespace-pre-wrap font-sans">{output}</pre>
                </div>
              )}

              {showCopyNotification && (
                <div className="fixed bottom-4 right-4 bg-[#4A90E2] text-white px-4 py-2 rounded-lg shadow-lg">
                  Copiado para a área de transferência!
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => copyToClipboard(item.response)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Prompt:</strong> {item.prompt}
                  </div>
                  <div className="text-sm">
                    <strong>Resposta:</strong> {item.response}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Nenhum histórico encontrado
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setRating('positive')}
                  className={`p-3 rounded-full transition-colors ${
                    rating === 'positive' ? 'bg-green-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp className={`w-6 h-6 ${
                    rating === 'positive' ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </button>
                <button
                  onClick={() => setRating('negative')}
                  className={`p-3 rounded-full transition-colors ${
                    rating === 'negative' ? 'bg-red-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <ThumbsDown className={`w-6 h-6 ${
                    rating === 'negative' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                </button>
              </div>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Compartilhe sua experiência com este agente..."
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
              />
              
              <button
                onClick={submitFeedback}
                disabled={!rating}
                className="w-full px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A80D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enviar Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDialog;
