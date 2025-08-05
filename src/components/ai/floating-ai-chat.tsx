import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AiChat } from "@/components/ai/ai-chat"
import { MessageCircle, X, Minimize2, Maximize2 } from "lucide-react"

export function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary shadow-primary hover:shadow-lg transition-all duration-300"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive p-0 text-xs">
            3
          </Badge>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] shadow-xl border-primary/20 animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">AI Assistant</span>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <CardContent className="p-0 h-[calc(500px-73px)]">
              <AiChat />
            </CardContent>
          )}
        </Card>
      )}
    </>
  )
}