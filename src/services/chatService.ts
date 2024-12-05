import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, CHATBOT_SYSTEM_PROMPT } from '../config/constants';
import { FilterService } from './filterService';
import { useStore } from '../store/useStore';

export class ChatService {
  private static instance: ChatService;
  private model: any;
  private context: string[] = [];

  private constructor() {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private formatProductSuggestions(products: any[]): string {
    if (products.length === 0) return "I couldn't find any products matching your criteria.";
    
    return products
      .slice(0, 3)
      .map(product => `• ${product.name} by ${product.brand} - $${product.price}
        ${product.description}`)
      .join('\n\n');
  }

  public async generateResponse(userMessage: string): Promise<string> {
    try {
      // Extract filters from user message
      const extractedFilters = FilterService.extractFiltersFromText(userMessage);
      
      // Get products from store
      const products = useStore.getState().products;
      
      // Filter products based on extracted criteria
      const filteredProducts = FilterService.filterProducts(products, extractedFilters);
      
      // Update store with filtered products
      useStore.getState().setChatbotResults(filteredProducts);
      
      // Add context about available products
      const productContext = this.formatProductSuggestions(filteredProducts);
      
      // Build complete prompt
      const prompt = `${CHATBOT_SYSTEM_PROMPT}

Previous context: ${this.context.join('\n')}

Available products based on user criteria:
${productContext}

User: ${userMessage}

Provide a helpful response that includes specific product recommendations from the available products list if relevant. If no products match exactly, suggest alternatives or ask for clarification.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // Update context
      this.context = [...this.context.slice(-2), userMessage, response.text()];
      
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }
}