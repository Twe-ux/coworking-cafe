import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedContent = content.trim()
    if (!trimmedContent || sending) return

    try {
      setSending(true)
      await onSendMessage(trimmedContent)
      setContent("")
    } catch (error) {
      console.error("Erreur envoi message:", error)
    } finally {
      setSending(false)
    }
  }

  // Gérer Ctrl+Enter pour envoyer
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message... (Ctrl+Enter pour envoyer)"
          disabled={disabled || sending}
          className="min-h-[60px] max-h-[200px] resize-none"
          rows={2}
        />
        <Button
          type="submit"
          disabled={!content.trim() || disabled || sending}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
