// utils/groq.ts
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.NEXT_GROQ_API_KEY,
});

export async function sendMessageToGroq(message: string): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em programação com foco em Bootstrap. Responda perguntas sobre desenvolvimento web, HTML, CSS, JavaScript e especialmente sobre como usar o framework Bootstrap para criar designs responsivos e elegantes. Formate suas respostas usando Markdown quando apropriado para melhor legibilidade.'
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'mixtral-8x7b-32768', // Using Mixtral model for better programming responses
    });

    return chatCompletion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
  } catch (error) {
    console.error('Erro ao chamar a API do Groq:', error);
    throw new Error('Falha ao obter resposta da IA');
  }
}