# ChatBot de Programação Especializado em Bootstrap

Este é um chatbot especializado em programação com foco em Bootstrap, desenvolvido com React, Next.js, TypeScript, Supabase e a API de IA do Groq.

## Funcionalidades

- Sistema de cadastro e login seguro com Supabase
- Interface de chat elegante e responsiva inspirada nas melhores IAs
- Integração com a API do Groq para respostas inteligentes sobre programação
- Foco especializado em Bootstrap e desenvolvimento web responsivo
- Mensagens organizadas com formatação adequada

## Tecnologias Utilizadas

- React e Next.js
- TypeScript
- Supabase (autenticação e banco de dados)
- Groq API (inteligência artificial)
- Bootstrap e React Bootstrap (design responsivo)
- Node.js

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente no arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
NEXT_GROQ_API_KEY=sua_chave_da_api_do_groq_aqui
```

3. Execute o projeto:
```bash
npm run dev
```

## Estrutura do Projeto

- `pages/` - Páginas da aplicação (index, autenticação, etc.)
- `components/` - Componentes reutilizáveis (interface do chat, etc.)
- `utils/` - Funções utilitárias (tipos, integração com APIs)
- `styles/` - Arquivos de estilo globais
- `public/` - Recursos estáticos

## Banco de Dados

O banco de dados no Supabase deve conter tabelas para usuários e mensagens de chat. Exemplos de estrutura estão disponíveis na seção de configuração do Supabase.

## Hospedagem

O projeto está preparado para ser hospedado no Railway, com suporte a variáveis de ambiente e escalabilidade automática.