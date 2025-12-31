import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface VegaAIProps {
  tripId?: string;
  tripName?: string;
}

const VegaAI = ({ tripId, tripName }: VegaAIProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'vega'; text: string }[]>([
    { role: 'vega', text: `Hi! I'm Vega, your AI travel assistant ✨ I'm here to help you plan the perfect ${tripName || 'trip'}! Ask me anything about destinations, activities, budgets, or get personalized suggestions based on your preferences.` }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    // Simulate AI response (In production, this would call an actual AI API)
    setTimeout(() => {
      const response = generateVegaResponse(userMessage);
      setMessages(prev => [...prev, { role: 'vega', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const generateVegaResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      return "Based on your trip budget, I recommend allocating:\n\n🏨 Accommodation: 30-40%\n🍽️ Food & Dining: 20-25%\n🎯 Activities: 20-25%\n🚗 Transportation: 15-20%\n💰 Emergency Fund: 5-10%\n\nWould you like specific recommendations for any category?";
    }

    if (lowerMessage.includes('destination') || lowerMessage.includes('place') || lowerMessage.includes('where')) {
      return "Considering your travel style and past journeys, here are some amazing destinations:\n\n🏔️ Adventure seekers: New Zealand, Iceland, Costa Rica\n🏖️ Beach lovers: Maldives, Bali, Greek Islands\n🏛️ Culture enthusiasts: Japan, Italy, Morocco\n🌆 City explorers: Tokyo, Barcelona, New York\n\nWhat type of experience are you looking for?";
    }

    if (lowerMessage.includes('activity') || lowerMessage.includes('things to do') || lowerMessage.includes('what to do')) {
      return "Here are some popular activities you might enjoy:\n\n🥾 Outdoor: Hiking, kayaking, zip-lining, cycling tours\n🎨 Cultural: Museums, cooking classes, local markets, historical tours\n🌊 Water sports: Snorkeling, surfing, diving, boat tours\n🍷 Relaxation: Spa days, wine tasting, sunset cruises\n\nTell me more about your interests!";
    }

    if (lowerMessage.includes('packing') || lowerMessage.includes('what to bring') || lowerMessage.includes('luggage')) {
      return "Essential packing tips:\n\n✅ Documents: Passport, tickets, travel insurance\n👕 Clothing: Check weather, pack layers, comfortable shoes\n🔌 Tech: Chargers, adapters, portable battery\n💊 Health: Medications, first-aid kit, sunscreen\n💼 Extras: Camera, reusable water bottle, day pack\n\nNeed a detailed packing list?";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm Vega, your personal travel AI! I'm excited to help you create unforgettable travel experiences. What would you like to know about your trip?";
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're very welcome! 🌟 I'm always here to help make your travels amazing. Feel free to ask me anything else!";
    }

    // Default response
    return "That's a great question! 🌟 As your AI travel assistant, I can help you with:\n\n• Destination recommendations\n• Budget planning and tips\n• Activity suggestions\n• Packing advice\n• Local customs and culture\n• Travel safety tips\n\nWhat specific aspect of your trip would you like to explore?";
  };

  return (
    <>
      {/* Vega Star Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Vega AI Assistant"
      >
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse-glow"></div>
          
          {/* Main star */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 rounded-full animate-ping delay-150"></div>
        </div>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Vega AI ✨
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] flex flex-col shadow-2xl border-2 border-purple-200 overflow-hidden bg-white/95 backdrop-blur-lg animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Vega AI</h3>
                <p className="text-xs text-purple-100">Your Travel Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/50 to-pink-50/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white shadow-md border border-purple-100'
                  }`}
                >
                  {message.role === 'vega' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">Vega</span>
                    </div>
                  )}
                  <p className={`text-sm whitespace-pre-line ${
                    message.role === 'user' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white shadow-md border border-purple-100 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-purple-100">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Vega anything..."
                className="flex-1 rounded-full border-2 border-purple-200 focus:border-purple-400"
              />
              <Button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full w-12 h-12 p-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default VegaAI;
