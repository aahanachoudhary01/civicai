const GEMINI_API_KEY = 'AQ.Ab8RN6ImHXQ33PacvQyMR3XIWPakFCvWxM5wVOBhtiY1UjkDqA'

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`

export async function analyzeImage(base64Image) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            },
            {
              text: `You are a civic issue detection AI for India. Analyze this image carefully and respond ONLY with a valid JSON object, no extra text, no markdown:
{
  "category": "Pothole or Water Leakage or Broken Streetlight or Garbage or Damaged Road or Open Drain or Other",
  "severity": "Low or Medium or High or Critical",
  "confidence": 90,
  "description": "One clear sentence describing the civic issue in the image",
  "affectedCitizens": 200,
  "estimatedDays": 3
}`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        }
      })
    })

    const data = await response.json()

    if (data.error) {
      console.error('Gemini API error:', data.error)
      return getFallbackResult()
    }

    const text = data.candidates[0].content.parts[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)

  } catch (err) {
    console.error('analyzeImage error:', err)
    return getFallbackResult()
  }
}

export async function generateDescription(title, category, location) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write a professional 2-3 sentence civic complaint description for: Title: ${title}, Category: ${category}, Location: ${location}. Be factual and clear.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 150,
        }
      })
    })

    const data = await response.json()
    if (data.error) return ''
    return data.candidates[0].content.parts[0].text

  } catch (err) {
    console.error('generateDescription error:', err)
    return ''
  }
}

function getFallbackResult() {
  return {
    category: 'Other',
    severity: 'Medium',
    confidence: 70,
    description: 'Civic issue detected. Please add more details manually.',
    affectedCitizens: 100,
    estimatedDays: 3
  }
}