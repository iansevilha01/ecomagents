import { FC } from 'react';
import { LayoutGrid, FileText, History, Users, Settings, Zap, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const COMMUNITY_URL = import.meta.env.VITE_COMMUNITY_URL || 'https://community.example.com';

const Sidebar: FC = () => {
  const location = useLocation();
  const signOut = useAuthStore(state => state.signOut);
  
  const menuItems = [
    { icon: FileText, label: 'Instruções', path: '/instructions', isExternal: false },
    { icon: LayoutGrid, label: 'Agentes', path: '/', isExternal: false },
    { icon: History, label: 'Histórico', path: '/history', isExternal: false },
    { icon: Users, label: 'Comunidade', path: COMMUNITY_URL, isExternal: true },
    { icon: Zap, label: 'Uso', path: '/usage', isExternal: false },
    { icon: Settings, label: 'Configurações', path: '/settings', isExternal: false }
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.isExternal) {
      window.open(item.path, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      <div className="p-4">
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Logo" className="w-full h-auto px-2" /> {/* Increased to full width with padding */}
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.isExternal && location.pathname === item.path;
            
            return item.isExternal ? (
              <button
                key={item.path}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
