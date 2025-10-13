"use client"

import React from "react"

interface FormattedResponseProps {
  content: string
}

export function FormattedResponse({ content }: FormattedResponseProps) {
  // Simple formatter without react-markdown dependency
  const formatContent = (text: string) => {
    let formattedText = text

    // Handle headings (e.g., ## Heading)
    formattedText = formattedText.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    formattedText = formattedText.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    formattedText = formattedText.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')

    // Handle bold text (e.g., **bold**)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')

    // Handle lists (e.g., - item)
    const lines = formattedText.split('\n')
    let inList = false
    const processedLines = lines.map((line) => {
      const isListItem = /^[-*]\s+(.*)/.test(line)
      
      if (isListItem) {
        const content = line.replace(/^[-*]\s+(.*)/, '$1')
        if (!inList) {
          inList = true
          return `<ul class="list-disc list-inside space-y-1 my-2"><li class="ml-4">${content}</li>`
        }
        return `<li class="ml-4">${content}</li>`
      } else {
        if (inList) {
          inList = false
          return `</ul><p class="mb-2">${line}</p>`
        }
        return line.trim() ? `<p class="mb-2">${line}</p>` : '<br/>'
      }
    })

    // Close list if still open
    if (inList) {
      processedLines.push('</ul>')
    }

    formattedText = processedLines.join('\n')

    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formattedText }} />
  }

  return <>{formatContent(content)}</>
}
