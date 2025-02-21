import { FC, useState } from 'react';
import { Star } from 'lucide-react';
import { Agent } from '../types';
import AgentDialog from './AgentDialog';

interface AgentCardProps {
  agent: Agent;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const AgentCard: FC<AgentCardProps> = ({ agent, isFavorite, onToggleFavorite }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div 
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-gray-50 rounded-lg">
            <span className="text-2xl">{agent.icon}</span>
          </div>
          <button 
            className={`text-gray-400 hover:text-yellow-400 transition-colors ${
              isFavorite ? 'text-yellow-400' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{agent.name}</h3>
            {agent.isNew && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                Novo!
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{agent.description}</p>
          <div className="pt-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {agent.category}
            </span>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <AgentDialog 
          agent={agent} 
          onClose={() => setIsDialogOpen(false)} 
        />
      )}
    </>
  );
}

export default AgentCard;
