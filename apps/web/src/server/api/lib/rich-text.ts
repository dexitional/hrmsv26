// Rich text written in the legacy staff portal (promotion application forms)
// is shown in the admin, so it is cleaned to a safe subset of HTML first.
import sanitizeHtml from 'sanitize-html'

export function cleanHtml(html: string | null | undefined): string | null {
  if (!html) return null
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'sup', 'sub', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'a'],
    allowedAttributes: { a: ['href', 'target', 'rel'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noreferrer' }) },
  })
}
