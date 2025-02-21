import { FC, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, Loader } from 'lucide-react';

const ResetPassword: FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if it's first access or password reset based on the search params
  const isFirstAccess = location.search === '?first=true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Se existe uma conta com este e-mail, você receberá um link para definir sua senha.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao enviar o email. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Logo" className="w-72 h-auto" />
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {isFirstAccess ? 'Primeiro Acesso' : 'Recuperar senha'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isFirstAccess 
            ? 'Digite seu e-mail corporativo para criar sua senha'
            : 'Digite seu e-mail e enviaremos as instruções'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-black focus:border-black"
                  placeholder={isFirstAccess ? "seunome@suaempresa.com.br" : "seu@email.com"}
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Enviar instruções'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
