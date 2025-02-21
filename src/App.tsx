import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AgentCard from './components/AgentCard';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Instructions from './pages/Instructions';
import Settings from './pages/Settings';
import Usage from './pages/Usage';
import History from './pages/History';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';

// Types
import { Agent } from './types';

const SAMPLE_AGENTS: Agent[] = [
  {
    id: 'roteiros-virais',
    name: 'Roteiros Virais',
    description: 'Descreva seu produto e gere um roteiro viral para as redes sociais',
    category: 'Conteúdo',
    icon: '🔥',
    isNew: true
  },
  {
    id: 'cria-email',
    name: 'Criador de E-mail',
    description: 'Crie um e-mail persuasivo para seu produto.',
    category: 'E-mails',
    icon: '📧'
  },
  {
    id: 'roteiros-conteudos',
    name: 'Roteiro de Conteúdos',
    description: 'Descreva sua ideia de conteúdo e gere um roteiro completo para seu vídeos',
    category: 'Conteúdo',
    icon: '🎥',
  },
  {
    id: 'hooks-virais',
    name: 'Hooks Virais',
    description: 'Crie ganchos otimizados para performar nas redes sociais.',
    category: 'Marketing',
    icon: '🎣',
    isNew: true
  },
  {
    id: 'seo-description',
    name: 'SEO Descrição',
    description: 'Crie descrições otimizados para SEO',
    category: 'Conteúdo',
    icon: '🔍',

  },
  {
    id: 'infinite-titles',
    name: 'Títulos Infinitos',
    description: 'Gere quantos títulos impossíveis de ignorar para seus posts, anúncios e vídeos.',
    category: 'Copywriting',
    icon: '∞'
  },
  {
    id: 'light-copy',
    name: 'Light Copy',
    description: 'Gere copy baseadas em premissas.',
    category: 'Copywriting',
    icon: '🚀',
    isNew: true
  },
  {
    id: 'texto-ads',
    name: 'Copy de Anúncios',
    description: 'Crie texto de copy para anúncios',
    category: 'Anúncios',
    icon: '📢'
  },
  {
    id: 'aida-copy',
    name: 'Criativos AIDA',
    description: 'Crie anúncios persuasivos com a fórmula AIDA.',
    category: 'Anúncios',
    icon: '🔍'
  },
  {
    id: 'email-upsell',
    name: 'E-mail de Upsell',
    description: 'Crie um e-mail de upsell para seus produtos',
    category: 'E-mails',
    icon: '📢'
  },
  {
    id: 'msb-copy',
    name: 'Criativos MSB',
    description: 'Crie anúncios persuasivos com a fórmula MSB.',
    category: 'Anúncios',
    icon: '🎯',
    isNew: true
  },
  {
    id: 'pas-copy',
    name: 'Criativos PAS',
    description: 'Crie anúncios persuasivos com a fórmula PAS.',
    category: 'Anúncios',
    icon: '😌'
  },
  {
    id: '4c-copy',
    name: 'Criativos 4C',
    description: 'Crie anúncios persuasivos com a fórmula 4C.',
    category: 'Anúncios',
    icon: '🧠'
  },
  {
    id: 'fab-copy',
    name: 'Criativos FAB',
    description: 'Crie anúncios persuasivos com a fórmula FAB.',
    category: 'Anúncios',
    icon: '🎨'
  },
  {
    id: 'acc-copy',
    name: 'Criativos ACC',
    description: 'Crie anúncios persuasivos com a fórmula ACC.',
    category: 'Anúncios',
    icon: '🚗'
  },
  {
    id: 'slap-copy',
    name: 'Criativos SLAP',
    description: 'Crie anúncios persuasivos com a fórmula SLAP.',
    category: 'Anúncios',
    icon: '👋'
  },
  {
    id: 'disc-copy',
    name: 'Variação DISC',
    description: 'Crie variações de anúncios de acordo com o perfil comportamental',
    category: 'Anúncios',
    icon: '🧩',
    isNew: true
  },
  {
    id: 'eneagrama-copy',
    name: 'Variação Eneagrama',
    description: 'Crie variações de anúncios de acordo com o tipo de personalidade',
    category: 'Anúncios',
    icon: '🔮',
    isNew: true
  },
  {
    id: 'hooks-copy',
    name: 'Variação Hooks',
    description: 'Crie variações de ganchos para anúncios',
    category: 'Anúncios',
    icon: '💥'
  }
];

interface LayoutWithSidebarProps {
  children: React.ReactNode;
}

const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <div className="ml-64">
      {children}
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteAgents');
    return saved ? JSON.parse(saved) : [];
  });

  const { user, loading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    localStorage.setItem('favoriteAgents', JSON.stringify(favorites));
  }, [favorites]);

  const tabs = ['Favoritos', 'Todos', 'Conteúdo', 'Anúncios', 'Marketing', 'E-mails', 'Copywriting', 'YouTube', 'Cliente', 'Novo!', 'Vendas'];

  const toggleFavorite = (agentId: string) => {
    setFavorites(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const filteredAgents = SAMPLE_AGENTS
    .filter(agent => {
      const matchesSearch = searchQuery === '' || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (activeTab) {
        case 'Todos':
          return true;
        case 'Novo!':
          return agent.isNew;
        case 'Favoritos':
          return favorites.includes(agent.id);
        default:
          return agent.category === activeTab;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const MainLayout = () => (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header 
          title="Todos os Agentes"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearch={setSearchQuery}
        />
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard 
                key={agent.id} 
                agent={agent}
                isFavorite={favorites.includes(agent.id)}
                onToggleFavorite={() => toggleFavorite(agent.id)}
              />
            ))}
          </div>
          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum agente encontrado para sua busca.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <Auth />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        <Route 
          path="/update-password" 
          element={<UpdatePassword />} 
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructions"
          element={
            <PrivateRoute>
              <LayoutWithSidebar>
                <Instructions />
              </LayoutWithSidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <LayoutWithSidebar>
                <Settings />
              </LayoutWithSidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/usage"
          element={
            <PrivateRoute>
              <LayoutWithSidebar>
                <Usage />
              </LayoutWithSidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <LayoutWithSidebar>
                <History />
              </LayoutWithSidebar>
            </PrivateRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
