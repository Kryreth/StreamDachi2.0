import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessageWithAnalysis } from "@/shared/schema";

interface ChatMessageProps {
  readonly message: ChatMessageWithAnalysis;
  readonly showSentiment?: boolean; // show sentiment badge (for Analytics only)
}

export function ChatMessage({ message, showSentiment = false }: ChatMessageProps) {
  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return "";
    switch (sentiment) {
      case "positive": return "text-green-400";
      case "negative": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="flex items-start space-x-3 p-2">
      <Avatar>
        <AvatarFallback>{message.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-200">{message.username}</div>
        <div className="text-gray-300">{message.message}</div>
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(message.timestamp))} ago
        </div>
        {showSentiment && message.sentiment && (
          <Badge className={getSentimentColor(message.sentiment)}>
            {message.sentiment}
          </Badge>
        )}
      </div>
    </div>
  );
}
