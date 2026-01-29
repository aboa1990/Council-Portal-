
import { GoogleGenAI, Type } from "@google/genai";
import { CitizenRequest, Asset } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the priority of a citizen service request using Gemini.
 */
export const analyzeRequestPriority = async (description: string, category: string): Promise<{ priority: string, reasoning: string, suggestedAction: string }> => {
  try {
    // Basic text task uses gemini-3-flash-preview
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are an AI assistant for a city council internal operations team. Analyze the following service request.
      
      Category: ${category}
      Description: ${description}

      Determine the priority level (Low, Medium, High, Critical) based on public safety impact, urgency, and resource allocation.
      Provide a brief reasoning and a suggested immediate action for the council staff to take (e.g., "Dispatch road crew", "Assign to parks dept").
    `;

    // Must use ai.models.generateContent to query GenAI with both the model name and prompt.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            reasoning: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ['priority', 'reasoning', 'suggestedAction']
        }
      }
    });

    // The GenerateContentResponse object features a text property (not a method).
    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    // Clean potential markdown or whitespace before parsing
    return JSON.parse(jsonText.trim());

  } catch (error) {
    console.error("Error analyzing request:", error);
    return {
      priority: 'Medium',
      reasoning: 'AI Analysis failed or API Key missing.',
      suggestedAction: 'Manual review required.'
    };
  }
};

/**
 * Generates a formal official response draft.
 */
export const generateOfficialResponse = async (request: CitizenRequest): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Draft a formal internal note or external email response (if applicable) regarding a citizen service request.
      
      Citizen Name: ${request.citizenName}
      Issue: ${request.title}
      Details: ${request.description}
      Current Status: ${request.status}
      
      Keep it professional, concise, and suitable for council records or communication. Max 150 words.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Directly access response.text property.
    return response.text || "Could not generate response.";

  } catch (error) {
    console.error("Error generating response:", error);
    return "Thank you for your request. We are currently processing it.";
  }
};

/**
 * Generates a maintenance plan for a council asset.
 */
export const generateMaintenancePlan = async (asset: Asset): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are a senior facility and fleet manager for a city council.
      Create a recommended maintenance schedule and safety checklist for the following asset.

      Asset Name: ${asset.name}
      Category: ${asset.category}
      Status: ${asset.status}
      Purchase Date: ${asset.purchaseDate}
      Current Notes: ${asset.notes || 'None'}

      Provide the output in Markdown format with:
      1. A short assessment of current state.
      2. A recommended maintenance frequency (e.g., Monthly, Quarterly).
      3. A bulleted checklist of key inspection points specific to this type of equipment.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Error generating maintenance plan:", error);
    return "Unable to generate maintenance plan at this time.";
  }
};

/**
 * Chat with a policy bot using conversational context.
 */
export const chatWithPolicyBot = async (query: string, history: string[]): Promise<string> => {
    try {
        const model = 'gemini-3-flash-preview';
        const prompt = `
        You are "CivicBot", a helpful assistant for city council internal staff. 
        Answer the following query about council operations, asset management protocols, or service request handling.
        
        Previous context: ${history.join('\n')}
        
        User Query: ${query}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text || "I apologize, I didn't catch that.";
    } catch (error) {
        console.error("Chat error", error);
        return "I am currently unavailable. Please try again later.";
    }
}
