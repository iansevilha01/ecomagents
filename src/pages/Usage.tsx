import { FC, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import { PLAN_LIMITS, PLAN_NAMES, PlanType } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UsageStats {
  totalCredits: number;
  planCredits: number;
  bonusCredits: number;
  currentPlan: string;
  creditsPerMonth: number;
  currentMonthUsage: number;
  remainingCredits: number;
}

const Usage: FC = () => {
  const { user } = useAuthStore();
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalCredits: 0,
    planCredits: 0,
    bonusCredits: 0,
    currentPlan: '',
    creditsPerMonth: 0,
    currentMonthUsage: 0,
    remainingCredits: 0
  });
  const [usageHistory, setUsageHistory] = useState<{ date: string; tokens: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsageData();
      loadUsageHistory();
    }
  }, [user]);

  const loadUsageData = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      const planType = profile.plan as PlanType;
      const monthlyLimit = PLAN_LIMITS[planType];
      const usedCredits = profile.credits_used || 0;
      const remainingCredits = monthlyLimit - usedCredits;

      setUsageStats({
        totalCredits: monthlyLimit,
        planCredits: monthlyLimit,
        bonusCredits: 0,
        currentPlan: PLAN_NAMES[planType],
        creditsPerMonth: monthlyLimit,
        currentMonthUsage: usedCredits,
        remainingCredits: remainingCredits
      });
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageHistory = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('usage_history')
        .select('created_at, tokens_used')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groupedData = data.reduce((acc: Record<string, number>, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + curr.tokens_used;
        return acc;
      }, {});

      setUsageHistory(
        Object.entries(groupedData).map(([date, tokens]) => ({
          date,
          tokens
        }))
      );
    } catch (error) {
      console.error('Error loading usage history:', error);
    }
  };

  const chartData = {
    labels: usageHistory.map(item => item.date),
    datasets: [
      {
        label: 'Palavras Usadas',
        data: usageHistory.map(item => item.tokens),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Palavras'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Data'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const usagePercentage = (usageStats.currentMonthUsage / usageStats.creditsPerMonth) * 100;
  const getUsageColor = () => {
    if (usagePercentage > 90) return 'bg-red-600';
    if (usagePercentage > 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-8">Uso & Plano</h1>

      <div className="grid gap-6 mb-8">
        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Plano atual</h2>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{usageStats.currentPlan}</span>
            <span className="ml-2 text-gray-500">
              {usageStats.creditsPerMonth.toLocaleString()} palavras/mês
            </span>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Palavras disponíveis</h3>
            <p className="text-3xl font-bold">{usageStats.remainingCredits.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Palavras do plano</h3>
            <p className="text-3xl font-bold">{usageStats.planCredits.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Palavras bônus</h3>
            <p className="text-3xl font-bold">{usageStats.bonusCredits.toLocaleString()}</p>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Uso nos últimos 30 dias</h2>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Current Month Usage */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Palavras usadas em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center">
            <span className="text-3xl font-bold">{usageStats.currentMonthUsage.toLocaleString()}</span>
            <span className="ml-2 text-gray-500">/ {usageStats.creditsPerMonth.toLocaleString()}</span>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getUsageColor()}`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {Math.round(usagePercentage)}% do limite mensal usado
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Comparação de planos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(PLAN_NAMES) as PlanType[]).map((planType) => (
              <div 
                key={planType}
                className={`p-6 rounded-lg border ${
                  usageStats.currentPlan === PLAN_NAMES[planType]
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <h3 className="text-xl font-semibold mb-2">{PLAN_NAMES[planType]}</h3>
                <p className="text-3xl font-bold mb-4">
                  {PLAN_LIMITS[planType].toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">palavras/mês</span>
                </p>
                {usageStats.currentPlan === PLAN_NAMES[planType] && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Plano atual
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;