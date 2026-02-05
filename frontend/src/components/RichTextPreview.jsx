import React, { useMemo } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export default function RichTextPreview({ content }) {
  // 1. Use useMemo to parse content so it doesn't re-run on every render
  const safeContent = useMemo(() => {
    // If it's already a valid array (BlockNote format)
    if (Array.isArray(content) && content.length > 0) {
      return content;
    }
    
    // If it's a legacy string or a simple text object
    if (typeof content === 'string' && content.trim() !== '') {
      return [{ 
        type: "paragraph", 
        content: [{ type: "text", text: content, styles: {} }] 
      }];
    }

    // Default empty state to prevent "No Content" errors
    return [{ type: "paragraph", content: [] }];
  }, [content]);

  // 2. Initialize the editor with the safe content
  const editor = useCreateBlockNote({
    initialContent: safeContent,
  });

  return (
    <div className="rich-text-preview-container" style={{
      maxHeight: '80px',      // Slightly shorter for better table density
      overflow: 'hidden',
      fontSize: '13px',       // Standard dashboard font size
      lineHeight: '1.4',
      pointerEvents: 'none',  // Ensures the table row remains clickable
      userSelect: 'none',     // Prevents accidental highlighting while clicking rows
      opacity: 0.9            // Differentiates preview from active editor
    }}>
      <BlockNoteView 
        editor={editor} 
        editable={false} 
        sideMenu={false}      // Hide UI elements for cleaner preview
        formattingToolbar={false}
      />
      
      {/* 3. Subtle Fade-out effect for long text */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '20px',
        background: 'linear-gradient(transparent, white)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}