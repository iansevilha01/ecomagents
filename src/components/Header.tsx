import { FC } from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  tabs?: string[];
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  onSearch?: (query: string) => void;
}

const Header: FC<HeaderProps> = ({ title, tabs, onTabChange, activeTab, onSearch }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{title}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar agentes..."
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {tabs && (
          <div className="flex space-x-6 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`pb-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
