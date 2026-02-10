// pages/index.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { User } from '../utils/types';
import { sendMessageToGroq } from '../utils/groq';
import ChatInterface from '../components/ChatInterface';
import supabaseService from '../utils/supabase';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    checkUserSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Head>
        <title>ChatBot de Programação - Especialista em Bootstrap</title>
        <meta name="description" content="Chatbot especializado em programação com foco em Bootstrap" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!user ? (
        <LoginScreen setUser={setUser} />
      ) : (
        <ChatInterface user={user} supabase={supabaseService.getClient()} />
      )}
    </div>
  );
}

function LoginScreen({ setUser }: { setUser: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (isSignUp) {
        response = await supabaseService.signUp(email, password);
      } else {
        response = await supabaseService.signIn(email, password);
      }

      if (response.error) {
        throw response.error;
      }

      if (response.data?.user) {
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Col md={6} lg={4}>
        <Card className="shadow">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2>{isSignUp ? 'Criar Conta' : 'Entrar'}</h2>
              <p className="text-muted">{isSignUp ? 'Crie sua conta para continuar' : 'Faça login para acessar o chat'}</p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 mb-3">
                {isSignUp ? 'Cadastrar' : 'Entrar'}
              </Button>
            </Form>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-decoration-none"
              >
                {isSignUp
                  ? 'Já tem uma conta? Faça login'
                  : 'Não tem uma conta? Cadastre-se'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}