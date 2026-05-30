import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import {
  Send,
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useDecryptPlaceholder } from '../hooks/useDecryptPlaceholder';
import { anthropic, MODELS, ADVISOR_SYSTEM_PROMPT } from '../lib/anthropic';

const ADVISOR_PHRASES = [
  'Qual é a sua dúvida estratégica?',
  'Pergunte sobre frequência de posts...',
  'Qual tese editorial quer desenvolver?',
  'Como posso orquestrar seu conteúdo?',
  'Qual agente usar para este tema?',
];

function Advisor() {
  const navigate = useNavigate();
  const { advisorHistory, addAdvisorMessage, agents } = useStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const { ref: advisorInputRef, onFocus: advisorFocus, onBlur: advisorBlur } = useDecryptPlaceholder(ADVISOR_PHRASES);



  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [advisorHistory, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage = {
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addAdvisorMessage(userMessage);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const history = [...advisorHistory, userMessage];
      const messages = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await anthropic.messages.create({
        model: MODELS.advisor,
        max_tokens: 1024,
        system: ADVISOR_SYSTEM_PROMPT,
        messages,
      });

      const replyText = response.content[0].text;

      addAdvisorMessage({
        sender: 'advisor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      addAdvisorMessage({
        sender: 'advisor',
        text: 'Algo deu errado na conexão. Tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRouteAgent = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  return (
    <div className="page-container advisor-page animate-fade-in">
      <header className="page-header">
        <div className="ai-orb-wrapper">
          <div className="ai-orb-glow"></div>
          <div className="ai-orb-core"></div>
        </div>
        <div className="header-text-container">
          <span className="header-subtitle">Advisor Estratégico</span>
          <h1 className="header-title">Fale com Linage</h1>
          <p className="header-desc">Pergunte sobre frequência, posicionamento ou qual agente faz mais sentido para o que você quer dizer. Eu conheço os cinco de perto.</p>
        </div>
      </header>

      {/* Grid of quick prompts & chat */}
      <div className="advisor-grid">
        {/* Chat Area */}
        <div className="advisor-chat-card glass-card">
          <div className="advisor-chat-messages">
            {/* Linage Welcome message */}
            <div className="advisor-message-row linage">
              <div className="linage-avatar-icon">
                L
              </div>
              <div className="advisor-msg-bubble">
                <p>Pode jogar qualquer coisa — uma dúvida sobre qual agente usar, uma notícia do dia que você não sabe por onde pegar, ou só um tema que ficou entalado. A gente vai de lá.</p>
                <div className="advisor-msg-suggestions">
                  <button onClick={() => setInputText("Qual agente usar para o que quero publicar?")} className="advisor-quick-btn">
                    Qual agente usar?
                  </button>
                  <button onClick={() => setInputText("Com que frequência devo publicar?")} className="advisor-quick-btn">
                    Com que frequência publicar?
                  </button>
                  <button onClick={() => setInputText("Como estruturo meu posicionamento no LinkedIn?")} className="advisor-quick-btn">
                    Como estruturo meu posicionamento?
                  </button>
                </div>
                <span className="advisor-msg-time">09:00</span>
              </div>
            </div>

            {/* State messages history */}
            {advisorHistory.map((msg, index) => (
              <div key={index} className={`advisor-message-row ${msg.sender === 'user' ? 'user' : 'linage'}`}>
                {msg.sender !== 'user' && (
                  <div className="linage-avatar-icon">L</div>
                )}
                <div className="advisor-msg-bubble">
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  <span className="advisor-msg-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="advisor-message-row linage">
                <div className="linage-avatar-icon">L</div>
                <div className="advisor-msg-bubble typing-bubble">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="advisor-chat-input">
            <input
              ref={advisorInputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={advisorFocus}
              onBlur={advisorBlur}
              className="advisor-input-text"
            />
            <button type="submit" className="advisor-send-btn">
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Strategic Guidelines Panel */}
        <div className="advisor-strategic-sidebar">
          {/* Quick Routing Card */}
          <div className="glass-card strategic-card">
            <div className="card-header-with-badge">
              <h3 className="strategic-title">Os Agentes</h3>
              <span className="pulse-dot-green">Ativos</span>
            </div>
            <p className="strategic-desc">Clique para abrir uma conversa direta.</p>
            
            <div className="routing-agents-list">
              {agents.map(agent => (
                <button 
                  key={agent.id} 
                  className="routing-agent-row-btn"
                  onClick={() => handleRouteAgent(agent.id)}
                >
                  <div className="routing-agent-info">
                    <span className="routing-agent-name">{agent.name}</span>
                    <span className="routing-agent-meta">
                      {agent.id === 'ashe'   && 'Induções Lógicas & Dados'}
                      {agent.id === 'jace'   && 'Desconstrução de Clichês'}
                      {agent.id === 'aiden'  && 'Analogias & Conexão'}
                      {agent.id === 'venn'   && 'Visão de Futuro e Padrões'}
                      {agent.id === 'dexter' && 'Humor Inteligente & Charme'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="routing-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Strategic stats card */}
          <div className="glass-card strategic-card metrics-card">
            <h3 className="strategic-title">Diagnóstico do Canal</h3>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-num">3/sem</span>
                <span className="metric-lbl">Frequência Ótima</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">89%</span>
                <span className="metric-lbl">Sinal Analítico</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">11%</span>
                <span className="metric-lbl">Ruído Comercial</span>
              </div>
            </div>
            <div className="strategic-disclaimer">
              <Activity size={12} style={{marginRight: 6}} />
              Próximo diagnóstico editorial em 48h.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Advisor;
