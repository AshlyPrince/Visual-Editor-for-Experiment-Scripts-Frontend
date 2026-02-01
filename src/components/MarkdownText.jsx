import React from 'react';
import { Typography, Box } from '@mui/material';

const MarkdownText = ({ content }) => {
  const parseMarkdown = (text) => {
    const parts = [];
    let lastIndex = 0;
    let key = 0;

    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, tag: 'bold-italic' },
      { regex: /\*\*(.+?)\*\*/g, tag: 'bold' },
      { regex: /\*(.+?)\*/g, tag: 'italic' },
      { regex: /`(.+?)`/g, tag: 'code' },
      { regex: /^(\d+)\.\s+/gm, tag: 'list-item' }
    ];

    const boldRegex = /\*\*(.+?)\*\*/g;
    const italicRegex = /\*(.+?)\*/g;
    const codeRegex = /`(.+?)`/g;
    
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const elements = [];
      let lastIdx = 0;
      let currentKey = 0;

      const matches = [];
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        matches.push({ index: match.index, length: match[0].length, text: match[1], type: 'bold' });
      }

      while ((match = italicRegex.exec(line)) !== null) {
        const isBold = matches.some(m => 
          match.index >= m.index && match.index < m.index + m.length
        );
        if (!isBold) {
          matches.push({ index: match.index, length: match[0].length, text: match[1], type: 'italic' });
        }
      }

      while ((match = codeRegex.exec(line)) !== null) {
        matches.push({ index: match.index, length: match[0].length, text: match[1], type: 'code' });
      }

      matches.sort((a, b) => a.index - b.index);

      matches.forEach(m => {
        if (m.index > lastIdx) {
          elements.push(
            <span key={`${lineIndex}-${currentKey++}`}>
              {line.substring(lastIdx, m.index)}
            </span>
          );
        }

        if (m.type === 'bold') {
          elements.push(
            <strong key={`${lineIndex}-${currentKey++}`} style={{ fontWeight: 600 }}>
              {m.text}
            </strong>
          );
        } else if (m.type === 'italic') {
          elements.push(
            <em key={`${lineIndex}-${currentKey++}`}>
              {m.text}
            </em>
          );
        } else if (m.type === 'code') {
          elements.push(
            <code 
              key={`${lineIndex}-${currentKey++}`}
              style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '2px 6px', 
                borderRadius: '3px',
                fontFamily: 'monospace',
                fontSize: '0.9em'
              }}
            >
              {m.text}
            </code>
          );
        }

        lastIdx = m.index + m.length;
      });

      if (lastIdx < line.length) {
        elements.push(
          <span key={`${lineIndex}-${currentKey++}`}>
            {line.substring(lastIdx)}
          </span>
        );
      }

      return (
        <React.Fragment key={lineIndex}>
          {elements.length > 0 ? elements : line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <Box component="div" sx={{ lineHeight: 1.6 }}>
      {parseMarkdown(content)}
    </Box>
  );
};

export default MarkdownText;
