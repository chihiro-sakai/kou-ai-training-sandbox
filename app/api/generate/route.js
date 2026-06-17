import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { job, feature, person, tone } = await req.json();

    const prompt = `
あなたは歯科医院の採用担当です。

職種: ${job}
医院の特徴: ${feature}
求める人物像: ${person}
雰囲気: ${tone}

自然で魅力的な求人文章を作成してください。
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      result: response.choices[0].message.content,
    });
  } catch (error) {
    return Response.json({
      error: error.message,
    });
  }
}