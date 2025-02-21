import { FC, useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Folder, FileText, Copy, Pencil, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface HistoryItem {
  id: string;
  agent_id: string;
  prompt: string;
  response: string;
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
  itemCount: number;
  items?: HistoryItem[];
}

const History: FC = () => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'all': true
  });
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_responses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group responses by agent
      const groupedResponses = (data || []).reduce((acc: Record<string, HistoryItem[]>, item) => {
        if (!acc[item.agent_id]) {
          acc[item.agent_id] = [];
        }
        acc[item.agent_id].push(item);
        return acc;
      }, {});

      // Create folders structure
      const newFolders: Folder[] = [
        {
          id: 'all',
          name: 'Todos os Chats',
          itemCount: data?.length || 0,
          items: data || []
        },
        ...Object.entries(groupedResponses).map(([agentId, items]) => ({
          id: agentId,
          name: formatAgentName(agentId),
          itemCount: items.length,
          items: items
        }))
      ];

      setFolders(newFolders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
    }
  };

  const formatAgentName = (agentId: string) => {
    // Convert agent-id to readable name
    return agentId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar with folders */}
      <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Histórico</h1>
          
          {folders.map(folder => (
            <div key={folder.id} className="mb-2">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-left"
              >
                <div className="flex items-center space-x-2">
                  {expandedFolders[folder.id] ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <Folder className="w-4 h-4 text-gray-500" />
                  <span>{folder.name}</span>
                </div>
                <span className="text-sm text-gray-500">({folder.itemCount})</span>
              </button>

              {expandedFolders[folder.id] && folder.items && (
                <div className="ml-6 mt-1 space-y-1">
                  {folder.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg text-left ${
                        selectedItem?.id === item.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {item.prompt || 'Sem prompt'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {selectedItem ? (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium">{formatAgentName(selectedItem.agent_id)}</h2>
                  <p className="text-sm text-gray-500">{formatDate(selectedItem.created_at)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(selectedItem.response)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Copiar resposta"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Prompt</h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedItem.prompt || 'Sem prompt'}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Resposta</h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedItem.response}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selecione um chat para ver os detalhes
          </div>
        )}
      </div>
    </div>
  );
};

export default History;