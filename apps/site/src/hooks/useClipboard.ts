import { useState } from 'react'

type CopiedValue = string | null
type CopyFn = (text: string) => Promise<string | null>

const useClipboard = (): [CopiedValue, CopyFn] => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)

  const copy: CopyFn = async (text: string) => {
    if (!navigator.clipboard) {
      return null
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      return text
    } catch (error) {
      setCopiedText(null)
      return null
    }
  }

  return [copiedText, copy]
}

export default useClipboard
