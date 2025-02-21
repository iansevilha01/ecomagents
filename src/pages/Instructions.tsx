import { FC } from 'react';
import { BookOpen, Zap, Shield, Clock, Users } from 'lucide-react';

const Instructions: FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Como usar a Plataforma</h1>
        <p className="text-gray-600">
          Bem-vindo à plataforma de Agentes AI. Aqui está tudo que você precisa saber para começar.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Conceitos Básicos
          </h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="mb-4">
              Nossa plataforma oferece uma série de agentes especializados em diferentes áreas do marketing e vendas.
              Cada agente é projetado para ajudar você a resolver problemas específicos e gerar conteúdo de alta qualidade.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Escolha o agente mais adequado para sua necessidade</li>
              <li>Forneça as informações necessárias no prompt</li>
              <li>Receba respostas otimizadas e prontas para uso</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Como Usar os Agentes
          </h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">1</span>
                <div>
                  <h3 className="font-medium mb-1">Selecione um Agente</h3>
                  <p className="text-gray-600">Na página inicial, escolha o agente que melhor atende sua necessidade atual.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">2</span>
                <div>
                  <h3 className="font-medium mb-1">Forneça as Informações</h3>
                  <p className="text-gray-600">Preencha o prompt com informações relevantes, seguindo as instruções específicas de cada agente.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">3</span>
                <div>
                  <h3 className="font-medium mb-1">Gere o Conteúdo</h3>
                  <p className="text-gray-600">Clique em "Gerar" e aguarde o agente processar sua solicitação.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">4</span>
                <div>
                  <h3 className="font-medium mb-1">Revise e Utilize</h3>
                  <p className="text-gray-600">Analise o conteúdo gerado, faça ajustes se necessário e utilize em suas estratégias.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Melhores Práticas
          </h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 mt-1 flex-shrink-0 text-green-500">✓</div>
                <div>
                  <h3 className="font-medium mb-1">Seja Específico</h3>
                  <p className="text-gray-600">Quanto mais detalhadas forem suas informações, melhores serão os resultados.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 mt-1 flex-shrink-0 text-green-500">✓</div>
                <div>
                  <h3 className="font-medium mb-1">Revise o Conteúdo</h3>
                  <p className="text-gray-600">Sempre revise e adapte o conteúdo gerado para seu contexto específico.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 mt-1 flex-shrink-0 text-green-500">✓</div>
                <div>
                  <h3 className="font-medium mb-1">Mantenha um Histórico</h3>
                  <p className="text-gray-600">Use a aba de histórico para acompanhar e reutilizar conteúdos anteriores.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Recursos Adicionais
          </h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Histórico</h3>
                <p className="text-gray-600">Acesse todos os seus conteúdos gerados anteriormente na aba de histórico.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Comunidade</h3>
                <p className="text-gray-600">Conecte-se com outros usuários e compartilhe experiências na aba de comunidade.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Feedback</h3>
                <p className="text-gray-600">Ajude-nos a melhorar fornecendo feedback sobre os resultados gerados.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Suporte</h3>
                <p className="text-gray-600">Precisa de ajuda? Nossa equipe de suporte está sempre disponível para auxiliar.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Instructions;
