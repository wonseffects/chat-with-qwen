// components/ChatInterface.tsx
import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { User, ChatMessage } from '../utils/types';
import { sendMessageToGroq } from '../utils/groq';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  user: User;
  supabase: any;
}

export default function ChatInterface({ user, supabase }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load previous messages
  useEffect(() => {
    loadPreviousMessages();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadPreviousMessages = async () => {
    // In a real app, you would fetch messages from Supabase
    // For now, we'll initialize with a welcome message
    setMessages([
      {
        id: 'welcome',
        content: 'Olá! Sou seu assistente especializado em programação com Bootstrap. Como posso ajudá-lo hoje?',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to Groq API
      const aiResponse = await sendMessageToGroq(inputValue);
      
      // Add AI response to messages
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        sender: 'system',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container fluid className="d-flex flex-column vh-100">
      {/* Header */}
      <Row className="flex-shrink-0 bg-gradient text-white p-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Col>
          <div className="d-flex flex-column align-items-start">
            <div className="d-flex align-items-center mb-2 w-100 justify-content-between">
              <div className="d-flex align-items-center">
                <h4 className="mb-0 fw-bold">🤖 ChatBot de Programação</h4>
                <Badge bg="light" text="dark" className="ms-2 d-none d-md-inline">Especialista em Bootstrap</Badge>
              </div>
              <div className="d-flex align-items-center">
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sair
                </Button>
              </div>
            </div>
            <div className="w-100 d-md-none">
              <Badge bg="light" text="dark" className="w-100 text-center">Especialista em Bootstrap</Badge>
            </div>
            <div className="w-100 mt-1">
              <small>Olá, {user.email}</small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Chat Messages */}
      <Row className="flex-grow-1 overflow-auto p-3 bg-light">
        <Col>
          <div className="chat-messages bg-white rounded-3 shadow-sm p-3" style={{ height: '100%', minHeight: '70vh' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex mb-3 ${
                  message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                <div
                  className={`p-3 rounded-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : message.sender === 'ai'
                      ? 'bg-light border'
                      : 'bg-warning text-dark'
                  }`}
                  style={{ 
                    maxWidth: '85%', 
                    borderRadius: message.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                    backgroundColor: message.sender === 'ai' ? '#f8f9ff' : ''
                  }}
                >
                  <div className="message-content">
                    {message.sender === 'ai' ? (
                      <ReactMarkdown 
                        className="markdown-content"
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Headers
                          h1: ({node, ...props}) => <h1 className="fw-bold text-primary" {...props} />,
                          h2: ({node, ...props}) => <h2 className="fw-semibold text-primary" {...props} />,
                          h3: ({node, ...props}) => <h3 className="fw-semibold text-primary" {...props} />,
                          
                          // Paragraphs
                          p: ({node, ...props}) => <p className="mb-2" {...props} />,
                          
                          // Lists
                          ul: ({node, ...props}) => <ul className="mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          
                          // Code blocks
                          code: ({node, inline, ...props}) => {
                            if (inline) {
                              return <code className="bg-light px-1 py-0 rounded text-primary" {...props} />;
                            } else {
                              return <pre className="bg-gray-100 p-2 rounded mt-2 mb-2 border"><code className="text-start" {...props} /></pre>;
                            }
                          },
                          
                          // Preformatted text
                          pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded mt-2 mb-2 border" {...props} />,
                          
                          // Text formatting
                          strong: ({node, ...props}) => <strong className="fw-bold" {...props} />,
                          em: ({node, ...props}) => <em className="fst-italic" {...props} />,
                          
                          // Blockquotes
                          blockquote: ({node, ...props}) => <blockquote className="border-start border-primary ps-2 fst-italic text-muted" {...props} />,
                          
                          // Links
                          a: ({node, ...props}) => <a className="text-primary text-decoration-underline" {...props} />,
                          
                          // Tables
                          table: ({node, ...props}) => <table className="table table-sm table-bordered" {...props} />,
                          thead: ({node, ...props}) => <thead {...props} />,
                          tbody: ({node, ...props}) => <tbody {...props} />,
                          tr: ({node, ...props}) => <tr {...props} />,
                          th: ({node, ...props}) => <th className="bg-light" {...props} />,
                          td: ({node, ...props}) => <td {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div>{message.content}</div>
                    )}
                  </div>
                  <small className="opacity-75 d-block mt-2 text-end">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="p-3 rounded-3 bg-light border" style={{ maxWidth: '85%' }}>
                  <div className="d-flex align-items-center">
                    <Spinner as="span" size="sm" animation="border" className="me-2" />
                    <span>Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Col>
      </Row>

      {/* Input Area */}
      <Row className="flex-shrink-0 p-3 bg-white border-top">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-3">
              <InputGroup>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem sobre programação ou Bootstrap..."
                  disabled={isLoading}
                  style={{ resize: 'none', maxHeight: '100px', border: 'none' }}
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="rounded-3 px-4"
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" size="sm" animation="border" className="me-1" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar →'
                  )}
                </Button>
              </InputGroup>
              <div className="mt-2">
                <small className="text-muted">Dica: Este assistente é especializado em Bootstrap, HTML, CSS e JavaScript. Suporte a Markdown incluso.</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}