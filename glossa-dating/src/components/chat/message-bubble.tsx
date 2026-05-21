import { Message } from "@/types";
import { formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className="max-w-[75%]">
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm",
            isOwn
              ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <p className={cn("text-[10px] text-gray-400 mt-1", isOwn ? "text-right" : "text-left")}>
          {formatTimeAgo(message.created_at)}
        </p>
      </div>
    </div>
  );
}
