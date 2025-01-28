import { GoogleGenerativeAI } from '@google/generative-ai';

interface CurrentExercise {
  name: string;
  sets: {
    weight: number;
    reps: number;
    is_completed: boolean;
  }[];
  personalRecord: {
    weight: number;
    reps: number;
    recorded_at: Date;
  } | null;
}

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
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

  async generateWorkoutAdvice(question: string, userProfile: {
    workoutSessionId?: string;
    goal?: string;
    currentExercises?: CurrentExercise[];
  }): Promise<string> {
    try {
      console.log('Generating workout advice for question:', question);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
あなたは経験豊富なストレングスコーチです。ユーザーの前回の記録（PR）を基に、プログレッシブオーバーロードの原則に従って最適なトレーニング負荷を提案してください。

ユーザープロフィール:
- 目標: ${userProfile?.goal || '未設定'}
${userProfile.workoutSessionId ? '- 現在トレーニング中' : '- トレーニング前'}

${userProfile.currentExercises && userProfile.currentExercises.length > 0 ? `
現在のエクササイズ状況:
${userProfile.currentExercises.map(exercise => `
■ ${exercise.name}
  - 本日の予定セット: ${exercise.sets.map(set => `${set.weight}kg × ${set.reps}回`).join(', ')}
  - 前回のPR: ${exercise.personalRecord ? `${exercise.personalRecord.weight}kg × ${exercise.personalRecord.reps}回` : 'なし'}
  
  【負荷提案】
  1. 前回のPRからの適切な重量増加量
  2. 推奨セット数とレップ数の詳細
  3. プログレッシブオーバーロードの具体的な進め方
`).join('\n')}
` : ''}

回答は以下の形式で日本語で提供してください：

1. 各エクササイズの具体的なセット構成の提案
   - ウォームアップセットの重量とレップ数
   - ワーキングセットの重量とレップ数
   - 前回のPRと比較した負荷の根拠説明

2. フォームと実施テクニック
   - 重量増加に伴う特に注意すべきフォームのポイント
   - 負荷強度に応じたテンポとコントロールの指示

3. 安全性とリスク管理
   - ウォームアップの重要性
   - フォームの崩れを防ぐためのチェックポイント
   - 疲労管理と回復の考慮事項

4. プログレッション戦略
   - 短期的な重量増加の目標設定
   - 長期的なプログレッションプラン
   - デロード（負荷軽減期間）の提案

5. 次回のトレーニングに向けた具体的な準備
   - 回復に必要な期間
   - 次回の目標重量の設定
   - モチベーション維持のためのアドバイス

ユーザーの質問: ${question}`;

      console.log('1----------');
      console.log(prompt);
      
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
      console.error('Detailed error in generateWorkoutAdvice:', {
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

  async analyzeMealImage(imageBuffer: Buffer) {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('画像データが空です');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // MIMEタイプの判定
      const imageSignature = imageBuffer.toString('hex', 0, 4);
      let mimeType = 'image/jpeg'; // デフォルト
      
      if (imageSignature.startsWith('89504e47')) {
        mimeType = 'image/png';
      } else if (imageSignature.startsWith('ffd8')) {
        mimeType = 'image/jpeg';
      } else {
        throw new Error('サポートされていない画像形式です。JPEGまたはPNG形式の画像を使用してください。');
      }

      const prompt = `
この食事の写真を分析して、以下の情報を日本語で提供してください：
1. 食品名
2. おおよその栄養成分（以下の形式で）：
   - カロリー（kcal）
   - タンパク質（g）
   - 炭水化物（g）
   - 脂質（g）

以下のJSON形式で返答してください：
{
  "foodName": "食品名",
  "nutrients": {
    "calories": 数値,
    "protein": 数値,
    "carbs": 数値,
    "fat": 数値
  }
}
`;

      console.log('画像解析を開始します...');
      
      const imageParts = [{
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      }];

      const result = await model.generateContent([prompt, ...imageParts]);
      if (!result || !result.response) {
        throw new Error('AIからの応答が空でした');
      }

      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('AIからの応答テキストが空でした');
      }

      console.log('AI応答テキスト:', text);
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON形式のデータが見つかりませんでした');
        }
        
        const jsonData = JSON.parse(jsonMatch[0]);
        if (!jsonData.foodName || !jsonData.nutrients) {
          throw new Error('必要なデータフィールドが不足しています');
        }
        
        return jsonData;
      } catch (error) {
        console.error('AI応答の解析エラー:', error);
        throw new Error('画像解析結果の処理中にエラーが発生しました');
      }
    } catch (error) {
      console.error('画像解析中のエラー:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        throw new Error(`画像解析中にエラーが発生しました: ${error.message}`);
      }
      throw new Error('画像解析中に予期せぬエラーが発生しました');
    }
  }
} 