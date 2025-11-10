import React, { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

interface CodeHighlighterProps {
  code: string
  language: 'bash' | 'python' | 'javascript' | 'json'
  className?: string
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ code, language, className = '' }) => {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      // Apply Prism.js highlighting directly
      const prismLanguage = getPrismLanguage(language)
      const languageDef = Prism.languages[prismLanguage]
      
      if (languageDef) {
        const highlightedCode = Prism.highlight(code, languageDef, prismLanguage)
        codeRef.current.innerHTML = highlightedCode
      } else {
        console.warn(`Prism language not found: ${prismLanguage}`)
        codeRef.current.textContent = code
      }
    }
  }, [code, language])

  // Map our language names to Prism.js language names
  const getPrismLanguage = (lang: string): string => {
    switch (lang) {
      case 'bash':
        return 'bash'
      case 'python':
        return 'python'
      case 'javascript':
        return 'javascript'
      case 'json':
        return 'json'
      default:
        return 'text'
    }
  }

  return (
    <pre 
      className={`font-mono text-sm leading-relaxed overflow-x-auto ${className}`}
      style={{
        backgroundColor: '#2d3748',
        color: '#f8f8f2',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #4a5568'
      }}
    >
      <code 
        ref={codeRef}
        className={`language-${getPrismLanguage(language)}`}
        style={{
          color: '#f8f8f2',
          backgroundColor: 'transparent'
        }}
      />
    </pre>
  )
}

export default CodeHighlighter