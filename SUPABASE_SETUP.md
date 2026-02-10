# Configuração do Banco de Dados no Supabase

Este documento descreve como configurar o banco de dados no Supabase para o ChatBot de Programação.

## Tabelas Necessárias

### 1. Tabela de Usuários (`users`)
Esta tabela já existe por padrão no Supabase Auth, mas você pode estendê-la:

```sql
-- A extensão auth já cria a tabela de usuários
-- Você pode adicionar colunas personalizadas à tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ler seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);
  
-- Função para inserir automaticamente um perfil quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Tabela de Mensagens de Chat (`chat_messages`)
```sql
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam e escrevam apenas suas próprias mensagens
CREATE POLICY "Usuários podem ler suas próprias mensagens" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias mensagens" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias mensagens" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3. Tabela de Histórico de Conversas (`conversations`)
```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários gerenciem apenas suas próprias conversas
CREATE POLICY "Usuários podem ler suas próprias conversas" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias conversas" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias conversas" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);
```

## Índices para Melhor Performance

```sql
-- Índice para mensagens por usuário e data
CREATE INDEX idx_chat_messages_user_id_created_at ON chat_messages (user_id, created_at DESC);

-- Índice para conversas por usuário e data
CREATE INDEX idx_conversations_user_id_created_at ON conversations (user_id, created_at DESC);
```

## Configurações Adicionais

### RLS (Row Level Security)
As políticas RLS acima garantem que os usuários só possam acessar seus próprios dados. Certifique-se de que o RLS esteja habilitado nas tabelas.

### Storage (para uploads futuros)
Se você quiser permitir que os usuários enviem imagens ou outros arquivos:

```sql
-- Criar bucket para avatares
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Política para permitir que usuários gerenciem seus próprios arquivos
CREATE POLICY "Usuários podem ler arquivos de avatar" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuários podem inserir arquivos de avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuários podem atualizar arquivos de avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuários podem deletar arquivos de avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## Configuração no Painel do Supabase

1. Acesse o painel do Supabase em https://app.supabase.com
2. Selecione seu projeto
3. Vá até a seção "SQL Editor"
4. Cole e execute os comandos SQL acima, na ordem indicada
5. Verifique se todas as tabelas foram criadas corretamente
6. Configure as variáveis de ambiente no seu aplicativo com as credenciais do Supabase