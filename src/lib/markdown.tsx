import React from "react"

function linkify(text: string, keyBase: number): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s<]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    const key = `l-${keyBase}-${i}`
    if (urlRegex.test(part)) {
      return React.createElement("a", {
        key,
        href: part,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "underline text-primary hover:text-primary/80",
      }, part)
    }
    return React.createElement(React.Fragment, { key }, part)
  })
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...linkify(text.slice(lastIndex, match.index), lastIndex))
    }
    if (match[2]) {
      parts.push(React.createElement("strong", { key: `b-${match.index}` }, ...linkify(match[2], match.index)))
    } else if (match[4]) {
      parts.push(React.createElement("em", { key: `i-${match.index}` }, ...linkify(match[4], match.index)))
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(...linkify(text.slice(lastIndex), lastIndex))
  }

  return parts
}

export function formatMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []

  function flushList() {
    if (listItems.length > 0) {
      nodes.push(React.createElement("ul", {
        key: `ul-${nodes.length}`,
        className: "list-disc pl-5 my-1.5 space-y-0.5",
      }, ...listItems))
      listItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)/)
    if (listMatch) {
      listItems.push(
        React.createElement("li", { key: `li-${i}` }, ...parseInline(listMatch[1]))
      )
      continue
    }

    flushList()
    const heading = trimmed.match(/^(#{1,3})\s+(.+)/)
    if (heading) {
      const level = heading[1].length
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements
      const sizeClass = level === 1 ? "text-lg font-bold" : level === 2 ? "text-base font-semibold" : "text-sm font-semibold"
      nodes.push(React.createElement(Tag, {
        key: `h-${i}`,
        className: `${sizeClass} mt-2 mb-1`,
      }, ...parseInline(heading[2])))
      continue
    }

    const hrMatch = trimmed.match(/^---+\s*$/)
    if (hrMatch) {
      nodes.push(React.createElement("hr", {
        key: `hr-${i}`,
        className: "my-2 border-border/50",
      }))
      continue
    }

    nodes.push(React.createElement("p", {
      key: `p-${i}`,
      className: "mb-1.5 last:mb-0",
    }, ...parseInline(trimmed)))
  }

  flushList()

  return nodes
}
