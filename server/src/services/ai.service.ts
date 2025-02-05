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
You are a nutrition advisor. Please provide specific meal plans and advice based on the following user profile and question.

User Profile:
- Age: ${userProfile?.age || 'Not set'} years
- Gender: ${userProfile?.gender || 'Not set'}
- Height: ${userProfile?.height || 'Not set'}cm
- Weight: ${userProfile?.weight || 'Not set'}kg
- Activity Level: ${userProfile?.activityLevel || 'Not set'}
- Goal: ${userProfile?.goal || 'Not set'}
- Dietary Restrictions: ${userProfile?.restrictions?.join(', ') || 'None'}
- Target Calories: ${userProfile?.calorieTarget || 'Not set'}kcal
- Target Protein: ${userProfile?.proteinTarget || 'Not set'}g
- Target Carbs: ${userProfile?.carbTarget || 'Not set'}g
- Target Fat: ${userProfile?.fatTarget || 'Not set'}g

Please provide your response in the following format:

1. Your estimated daily caloric needs
2. Recommended calories for your goal
3. Recommended daily meal plan (breakfast, lunch, dinner, snacks)
   - Specific menu examples for each meal
   - Approximate calories and key nutrients for each meal
4. Key nutrients to focus on and why
5. Practical advice for achieving your goal
6. Importance of meal tracking and continuous monitoring

User Question: ${query}`;

      console.log('Sending prompt to Gemini API');
      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini API');

      if (!result || !result.response) {
        console.error('Empty response from Gemini API');
        throw new Error('Empty response from AI');
      }

      const response = await result.response;
      const text = response.text();

      if (!text) {
        console.error('Empty text in Gemini API response');
        throw new Error('Empty response text from AI');
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
        throw new Error(`Error occurred while generating AI advice: ${error.message}`);
      }
      throw new Error('Unexpected error occurred while generating AI advice');
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
You are an experienced strength coach. Please suggest optimal training loads based on the user's previous records (PR), following the principle of progressive overload.

User Profile:
- Goal: ${userProfile?.goal || 'Not set'}
${userProfile.workoutSessionId ? '- Currently training' : '- Before training'}

${userProfile.currentExercises && userProfile.currentExercises.length > 0 ? `
Current Exercise Status:
${userProfile.currentExercises.map(exercise => `
■ ${exercise.name}
  - Today's planned sets: ${exercise.sets.map(set => `${set.weight}kg × ${set.reps} reps`).join(', ')}
  - Previous PR: ${exercise.personalRecord ? `${exercise.personalRecord.weight}kg × ${exercise.personalRecord.reps} reps` : 'None'}
  
  [Load Suggestions]
  1. Appropriate weight increase from previous PR
  2. Detailed recommended sets and reps
  3. Specific approach to progressive overload
`).join('\n')}
` : ''}

Please provide your response in the following format:

1. Specific set composition suggestions for each exercise
   - Warm-up sets weight and reps
   - Working sets weight and reps
   - Explanation of load based on previous PR

2. Form and execution technique
   - Key form points to watch as weight increases
   - Tempo and control instructions based on load intensity

3. Safety and risk management
   - Importance of warm-up
   - Form checkpoints
   - Fatigue management considerations

4. Progression strategy
   - Short-term weight increase goals
   - Long-term progression plan
   - Deload period suggestions

5. Specific preparation for next training
   - Required recovery period
   - Next target weight setting
   - Advice for maintaining motivation

User Question: ${question}`;

      console.log('1----------');
      console.log(prompt);
      
      console.log('Sending prompt to Gemini API');
      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini API');

      if (!result || !result.response) {
        console.error('Empty response from Gemini API');
        throw new Error('Empty response from AI');
      }

      const response = await result.response;
      const text = response.text();

      if (!text) {
        console.error('Empty text in Gemini API response');
        throw new Error('Empty response text from AI');
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
        throw new Error(`Error occurred while generating AI advice: ${error.message}`);
      }
      throw new Error('Unexpected error occurred while generating AI advice');
    }
  }

  async analyzeMealImage(imageBuffer: Buffer) {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Image data is empty');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // MIME type detection
      const imageSignature = imageBuffer.toString('hex', 0, 4);
      let mimeType = 'image/jpeg'; // default
      
      if (imageSignature.startsWith('89504e47')) {
        mimeType = 'image/png';
      } else if (imageSignature.startsWith('ffd8')) {
        mimeType = 'image/jpeg';
      } else {
        throw new Error('Unsupported image format. Please use JPEG or PNG format.');
      }

      const prompt = `
Please analyze this meal photo and provide the following information:
1. Food name
2. Approximate nutritional content in the following format:
   - Calories (kcal)
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)

Please respond in the following JSON format:
{
  "foodName": "Food name",
  "nutrients": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  }
}
`;

      console.log('Starting image analysis...');
      
      const imageParts = [{
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      }];

      const result = await model.generateContent([prompt, ...imageParts]);
      if (!result || !result.response) {
        throw new Error('Empty response from AI');
      }

      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('Empty response text from AI');
      }

      console.log('AI response text:', text);
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON data not found');
        }
        
        const jsonData = JSON.parse(jsonMatch[0]);
        if (!jsonData.foodName || !jsonData.nutrients) {
          throw new Error('Required data fields are missing');
        }
        
        return jsonData;
      } catch (error) {
        console.error('Error parsing AI response:', error);
        throw new Error('Error occurred while processing image analysis results');
      }
    } catch (error) {
      console.error('Error during image analysis:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        throw new Error(`Error occurred during image analysis: ${error.message}`);
      }
      throw new Error('Unexpected error occurred during image analysis');
    }
  }
} 