import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const Auth: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/icone.svg" alt="Icon" className="w-24 h-24" /> {/* Reverted back to the previous size */}
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Entre na sua conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          Ao continuar, você concorda com nossos{' '}
          <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
