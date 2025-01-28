import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    console.log('Initializing Gemini API with key length:', apiKey.length);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateNutritionAdvice(query: string): Promise<string> {
    try {
      console.log('Generating nutrition advice for query:', query);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
あなたは栄養アドバイザーです。以下の質問に対して、具体的な食事プランとアドバイスを提供してください。
回答は以下の形式で日本語で提供してください：

1. 推奨される1日の食事プラン（朝食、昼食、夕食）
2. 各食事のおおよそのカロリー
3. 特に注意すべき栄養素
4. 実践的なアドバイス

ユーザーの質問: ${query}`;

      console.log('Sending prompt to Gemini API');
      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini API');

      if (!result || !result.response) {
        console.error('Empty response from Gemini API');
        throw new Error('AIからの応答が空でした');
      }

      const response = await result.response;
      const text = response.text();

      if (!text) {
        console.error('Empty text in Gemini API response');
        throw new Error('AIからの応答テキストが空でした');
      }

      console.log('Successfully generated advice with length:', text.length);
      return text;
    } catch (error) {
      console.error('Detailed error in generateNutritionAdvice:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        throw new Error(`AIアドバイスの生成中にエラーが発生しました: ${error.message}`);
      }
      throw new Error('AIアドバイスの生成中に予期せぬエラーが発生しました');
    }
  }
} 