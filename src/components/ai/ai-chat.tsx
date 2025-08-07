import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, TrendingUp, Receipt, Calculator } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface AiChatProps {
  onInsightGenerated?: (insight: string) => void;
}

export const AiChat = ({ onInsightGenerated }: AiChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi! I'm your AI accounting assistant. I can help you categorize expenses, analyze your financial data, and provide business insights. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase.functions.invoke('ai-business-insights', {
        body: { 
          message,
          context: "chat",
          includeFinancialData: true
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (onInsightGenerated && data.insight) {
        onInsightGenerated(data.insight);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const suggestedQuestions = [
    {
      icon: TrendingUp,
      text: "Show me my top expense categories this month",
      query: "What are my top expense categories this month?"
    },
    {
      icon: Receipt,
      text: "Analyze my recent receipts",
      query: "Can you analyze my recent expense receipts?"
    },
    {
      icon: Calculator,
      text: "Calculate my GST/HST liability",
      query: "What's my current GST/HST liability based on my expenses?"
    }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Business Assistant
        </CardTitle>
      </CardHeader>
      
      <CardBody display="flex" flexDirection="column" gap={4} flex="1">
        <ScrollArea className="flex-1 max-h-96">
          <div className="space-y-4 pr-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
                
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              Try asking:
            </p>
            <div className="grid gap-2">
              {suggestedQuestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => {
                    setInput(suggestion.query);
                    const userMessage: Message = {
                      id: Date.now().toString(),
                      content: suggestion.query,
                      role: "user",
                      timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, userMessage]);
                    chatMutation.mutate(suggestion.query);
                  }}
                >
                  <suggestion.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{suggestion.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Ask about your expenses, receipts, or business insights..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={chatMutation.isPending}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || chatMutation.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};