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

  async generateNutritionAdvice(query: string, userProfile: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    activityLevel?: string;
    goal?: string;
    restrictions?: string[];
    calorieTarget?: number;
    proteinTarget?: number;
    carbTarget?: number;
    fatTarget?: number;
  }): Promise<string> {
    try {
      console.log('Generating nutrition advice for query:', query);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
あなたは栄養アドバイザーです。以下のユーザープロフィールと質問に基づいて、具体的な食事プランとアドバイスを提供してください。

ユーザープロフィール:
- 年齢: ${userProfile?.age || '未設定'}歳
- 性別: ${userProfile?.gender || '未設定'}
- 身長: ${userProfile?.height || '未設定'}cm
- 体重: ${userProfile?.weight || '未設定'}kg
- 活動レベル: ${userProfile?.activityLevel || '未設定'}
- 目標: ${userProfile?.goal || '未設定'}
- 食事制限: ${userProfile?.restrictions?.join(', ') || '特になし'}
- 目標カロリー: ${userProfile?.calorieTarget || '未設定'}kcal
- 目標タンパク質: ${userProfile?.proteinTarget || '未設定'}g
- 目標炭水化物: ${userProfile?.carbTarget || '未設定'}g
- 目標脂質: ${userProfile?.fatTarget || '未設定'}g

回答は以下の形式で日本語で提供してください：

1. あなたの現在の1日の推定必要カロリー
2. 目標達成のための推奨カロリー
3. 推奨される1日の食事プラン（朝食、昼食、夕食、間食）
   - 各食事の具体的なメニュー例
   - 各食事のおおよそのカロリーと主要な栄養素
4. 特に注意すべき栄養素とその理由
5. あなたの目標達成のための実践的なアドバイス
6. 食事記録の重要性と継続的なモニタリングについて

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