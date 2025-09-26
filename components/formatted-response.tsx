"use client"

import type React from "react"

interface FormattedResponseProps {
  content: string
}

export function FormattedResponse({ content }: FormattedResponseProps) {
  const parseContent = (text: string) => {
    if (!text) return []

    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let currentIndex = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!line) {
        elements.push(<br key={`br-${currentIndex++}`} />)
        continue
      }

      // Parse headers (##, ###, ####)
      if (line.startsWith("##")) {
        const level = line.match(/^#+/)?.[0].length || 2
        const headerText = line.replace(/^#+\s*/, "").trim()

        if (level === 2) {
          elements.push(
            <h2 key={`h2-${currentIndex++}`} className="text-xl font-bold text-foreground mt-6 mb-3 first:mt-0">
              {headerText}
            </h2>,
          )
        } else if (level === 3) {
          elements.push(
            <h3 key={`h3-${currentIndex++}`} className="text-lg font-semibold text-foreground mt-4 mb-2">
              {headerText}
            </h3>,
          )
        } else {
          elements.push(
            <h4 key={`h4-${currentIndex++}`} className="text-base font-medium text-foreground mt-3 mb-2">
              {headerText}
            </h4>,
          )
        }
        continue
      }

      // Parse numbered items (1., 2., etc.)
      if (/^\d+\.\s/.test(line)) {
        const parsedLine = parseInlineFormatting(line)
        elements.push(
          <div key={`numbered-${currentIndex++}`} className="mb-2 text-sm leading-relaxed">
            {parsedLine}
          </div>,
        )
        continue
      }

      // Parse bullet points (-, *, •)
      if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
        const bulletText = line.replace(/^[-*•]\s+/, "").trim()
        const parsedText = parseInlineFormatting(bulletText)
        elements.push(
          <div key={`bullet-${currentIndex++}`} className="flex items-start gap-2 mb-1 text-sm leading-relaxed">
            <span className="text-muted-foreground mt-1 flex-shrink-0">•</span>
            <span>{parsedText}</span>
          </div>,
        )
        continue
      }

      // Parse table rows (lines with | characters)
      if (line.includes("|") && line.split("|").length > 2) {
        // Look ahead to collect all table rows
        const tableRows = [line]
        let j = i + 1
        while (j < lines.length && lines[j].trim() && (lines[j].includes("|") || lines[j].match(/^[\s\-|]+$/))) {
          tableRows.push(lines[j].trim())
          j++
        }

        if (tableRows.length > 1) {
          const table = parseTable(tableRows)
          if (table) {
            elements.push(table)
            i = j - 1 // Skip the processed table rows
            currentIndex++
            continue
          }
        }
      }

      // Regular paragraph
      if (line) {
        const parsedLine = parseInlineFormatting(line)
        elements.push(
          <p key={`p-${currentIndex++}`} className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {parsedLine}
          </p>,
        )
      }
    }

    return elements
  }

  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let currentText = text
    let keyIndex = 0

    // Parse **bold** text and *italic* text
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      const placeholder = `__BOLD_${keyIndex}__`
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-foreground">
          {content}
        </strong>,
      )
      return placeholder
    })
    
    // Parse *italic* text (but not **bold**)
    currentText = currentText.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, (match, content) => {
      const placeholder = `__ITALIC_${keyIndex}__`
      parts.push(
        <em key={`italic-${keyIndex++}`} className="italic">
          {content}
        </em>,
      )
      return placeholder
    })

    // Parse <strong> HTML tags
    currentText = currentText.replace(/<strong>(.*?)<\/strong>/g, (match, content) => {
      const placeholder = `__STRONG_${keyIndex}__`
      parts.push(
        <strong key={`strong-${keyIndex++}`} className="font-semibold text-foreground">
          {content}
        </strong>,
      )
      return placeholder
    })

    // Split text and insert formatted parts
    const segments = currentText.split(/(__(?:BOLD|STRONG|ITALIC)_\d+__)/)
    const result: React.ReactNode[] = []

    segments.forEach((segment, index) => {
      if (segment.startsWith("__BOLD_") || segment.startsWith("__STRONG_") || segment.startsWith("__ITALIC_")) {
        const partIndex = Number.parseInt(segment.match(/\d+/)?.[0] || "0")
        result.push(parts[partIndex])
      } else if (segment) {
        result.push(segment)
      }
    })

    return result.length > 0 ? result : [text]
  }

  const parseTable = (rows: string[]) => {
    try {
      // Filter out separator rows (e.g., |---|---|---| or | --- | --- |)
      const cleanRows = rows.filter((row) => {
        const trimmed = row.trim()
        return trimmed && !trimmed.match(/^[\s|]*[-:]+[\s|\-:]*$/)
      })

      if (cleanRows.length < 2) return null

      const parseRow = (row: string) => {
        // Handle rows that may start/end with |
        let cleanRow = row.trim()
        if (cleanRow.startsWith("|")) cleanRow = cleanRow.substring(1)
        if (cleanRow.endsWith("|")) cleanRow = cleanRow.slice(0, -1)
        
        return cleanRow
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell !== "")
      }

      const headerRow = parseRow(cleanRows[0])
      const dataRows = cleanRows.slice(1).map(parseRow)

      if (headerRow.length === 0) return null

      return (
        <div key="table" className="my-4 overflow-x-auto">
          <table className="w-full border-collapse border border-border rounded-lg">
            <thead>
              <tr className="bg-muted/50">
                {headerRow.map((header, index) => (
                  <th
                    key={`header-${index}`}
                    className="border border-border px-3 py-2 text-left text-sm font-semibold text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="border border-border px-3 py-2 text-sm text-muted-foreground"
                    >
                      {parseInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    } catch (error) {
      console.error("Error parsing table:", error)
      return null
    }
  }

  const elements = parseContent(content)

  return <div className="text-sm leading-relaxed">{elements}</div>
}
