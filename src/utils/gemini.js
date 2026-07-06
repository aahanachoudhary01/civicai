const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzeImage(base64Image) {
  try {
    // 1. Base64 string ka mime type (png/jpeg) aur clean data nikalna
    const mimeType = base64Image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // 2. Google Gemini Stable Flash Model Call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this civic issue image. You must respond with ONLY a raw JSON object. Do not include markdown formatting, do not include ```json. Use this exact structure based strictly on what you see in the image: { \"category\": \"Pothole or Garbage or Waterlogging or Streetlight etc\", \"severity\": \"Low or Medium or High\", \"confidence\": 95, \"description\": \"A clear 1-sentence description of the issue visible\", \"affectedCitizens\": 30, \"estimatedDays\": 3 }"
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Failed: ${errorText}`);
    }

    const data = await response.json();
    let content = data.candidates[0].content.parts[0].text.trim();
    
    // Kisi bhi tarah ka extra markdown clean karna
    content = content.replace(/```json|```/g, "").trim();
    
    // Sahi dynamic JSON object return hoga jo Report.jsx ko chaiye
    return JSON.parse(content);

  } catch (error) {
    console.error("Real API Error:", error);
    throw error; 
  }
}