import { GoogleGenAI } from "@google/genai";
import { IAIGatewayService } from "../../domain/services.ts";
import { Layer } from "../../domain/entities.ts";

export class GeminiAdapter implements IAIGatewayService {
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (this.client) return this.client;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI operations will use Neora local rule-engine fallback.");
      return null;
    }
    this.client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    return this.client;
  }

  async generateLayout(prompt: string, context: string): Promise<{ title: string; explanation: string; suggestedLayers: Array<Partial<Layer>> }> {
    const ai = this.getClient();
    const systemPrompt = `You are Neora, the advanced Graphic Layout AI. Based on the user brief and canvas context, output a clean, high-contrast visual layout.
    Return ONLY a valid JSON object matching this schema:
    {
      "title": "A short descriptive title",
      "explanation": "Brief explanation of color pairing, contrast ratios, and alignment choices.",
      "suggestedLayers": [
        {
          "name": "Layer Name",
          "type": "text" | "shape",
          "x": number (percentage 0-100),
          "y": number (percentage 0-100),
          "width": number (percentage 1-100),
          "height": number (percentage 1-100),
          "opacity": number (0-1),
          "content": "Text string or 'rect'/'circle'",
          "fontSize": number,
          "fontFamily": "Inter" | "Space Grotesk" | "JetBrains Mono",
          "color": "Hex color code",
          "align": "left" | "center" | "right"
        }
      ]
    }`;

    if (!ai) {
      // Rule-based fallback if no API key is set
      return {
        title: "Rule-Engine Balanced Layout Suggestion",
        explanation: "Auto-generated fallback since GEMINI_API_KEY was not supplied. Applied gold-ratio hierarchy.",
        suggestedLayers: [
          {
            name: "Gold Banner Background",
            type: "shape",
            x: 10,
            y: 10,
            width: 80,
            height: 80,
            opacity: 0.9,
            content: "rect",
            color: "#1e1e24",
            borderRadius: 16
          },
          {
            name: "Core Brand Header",
            type: "text",
            x: 50,
            y: 35,
            width: 70,
            height: 12,
            opacity: 1,
            content: prompt.toUpperCase() || "NEORA OS PREVIEW",
            fontSize: 32,
            fontFamily: "Space Grotesk",
            color: "#ffffff",
            align: "center",
            fontWeight: "bold"
          },
          {
            name: "Contrast Subtitle label",
            type: "text",
            x: 50,
            y: 60,
            width: 60,
            height: 8,
            opacity: 0.8,
            content: "Auto-engineered balanced canvas",
            fontSize: 14,
            fontFamily: "JetBrains Mono",
            color: "#22d3ee",
            align: "center"
          }
        ]
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Canvas Context: ${context}\nUser Brief: ${prompt}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) throw new Error("Received empty response from Gemini model.");
      return JSON.parse(text);
    } catch (err: any) {
      console.error("Gemini Layout Generation API failure, utilizing fallback.", err);
      return {
        title: "Safety Fallback Artboard",
        explanation: `Gemini API invocation experienced a network or credential issue: ${err.message}. Showing local outline.`,
        suggestedLayers: [
          {
            name: "Artboard Overlay Backdrop",
            type: "shape",
            x: 15,
            y: 15,
            width: 70,
            height: 70,
            opacity: 0.85,
            content: "rect",
            color: "#0f172a",
            borderRadius: 12
          },
          {
            name: "Header Error Warning",
            type: "text",
            x: 50,
            y: 45,
            width: 60,
            height: 10,
            opacity: 1,
            content: "Neora Gateway Active",
            fontSize: 24,
            fontFamily: "Space Grotesk",
            color: "#f43f5e",
            align: "center"
          }
        ]
      };
    }
  }

  async analyzeVisuals(imageUrl: string, prompt: string): Promise<string> {
    const ai = this.getClient();
    if (!ai) {
      return "Neora Local Vision simulation: Image is perceived as a beautiful structured balance of negative space and graphic density.";
    }
    try {
      // In @google/genai SDK, multimodal contents can be supplied as remote image URLs or local Base64 files.
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          prompt || "Analyze the visual elements, balance, contrast, and typography hierarchy in this layout design.",
          {
            fileData: {
              fileUri: imageUrl,
              mimeType: "image/jpeg"
            }
          }
        ]
      });
      return response.text || "No analysis generated.";
    } catch (err: any) {
      return `Vision analysis fallback: Connected to Neora, but visual processing failed with: ${err.message}`;
    }
  }

  async chat(prompt: string, history: Array<{ role: "user" | "model"; text: string }>, projectId?: string): Promise<string> {
    const ai = this.getClient();
    if (!ai) {
      const answers = [
        "I can help you build the visual layout directly. Try typing: 'create a neon poster'.",
        "Neora system core is active! I pair classical display fonts with monospace labels to produce Swiss-Modern graphics.",
        "Your workspace and project memory are securely synchronized. Let me know which element to refine next!"
      ];
      return answers[Math.floor(Math.random() * answers.length)];
    }

    try {
      const formattedHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...formattedHistory,
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "You are Neora, the world-class graphic software AI design engineer. Help the user plan out typographic grids, select colors, and structure canvas layers."
        }
      });
      return response.text || "Neora processed your request.";
    } catch (err: any) {
      return `Neora processing delay. Local Engine response: Let's focus on aligning our typographic nodes to create a balanced structure. Error info: ${err.message}`;
    }
  }
}
