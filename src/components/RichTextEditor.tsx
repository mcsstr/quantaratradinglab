import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Image as ImageIcon, Heading1, Heading2, List, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export default function RichTextEditor({ value, onChange, theme }: any) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  // Only set innerHTML when value changes from OUTSIDE the component
  useEffect(() => {
    if (editorRef.current && !isComposingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_WIDTH = 900;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/webp', 0.82);

        editorRef.current?.focus();
        const imgHtml = `<div style="display:inline-block;resize:both;overflow:hidden;margin:8px;border-radius:6px;max-width:100%;min-width:50px;min-height:50px;"><img src="${compressed}" style="display:block;width:100%;height:100%;object-fit:cover;" /></div><p><br/></p>`;
        execCmd('insertHTML', imgHtml);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const btnClass = "p-1.5 rounded-md transition-colors hover:bg-white/10 opacity-60 hover:opacity-100 flex items-center justify-center";

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden h-full" style={{ borderColor: theme.contornoGeral, background: 'rgba(0,0,0,0.15)' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-black/30 shrink-0" style={{ borderColor: theme.contornoGeral }}>
        <button onClick={() => execCmd('bold')} className={btnClass} title="Bold"><Bold size={13} style={{ color: theme.textoPrincipal }} /></button>
        <button onClick={() => execCmd('italic')} className={btnClass} title="Italic"><Italic size={13} style={{ color: theme.textoPrincipal }} /></button>
        <button onClick={() => execCmd('underline')} className={btnClass} title="Underline"><Underline size={13} style={{ color: theme.textoPrincipal }} /></button>
        
        <div className="w-px h-3 bg-white/10 mx-1" />
        
        <button onClick={() => execCmd('formatBlock', 'H1')} className={btnClass} title="Title"><Heading1 size={13} style={{ color: theme.textoPrincipal }} /></button>
        <button onClick={() => execCmd('formatBlock', 'H2')} className={btnClass} title="Subtitle"><Heading2 size={13} style={{ color: theme.textoPrincipal }} /></button>
        <button onClick={() => execCmd('insertUnorderedList')} className={btnClass} title="List"><List size={13} style={{ color: theme.textoPrincipal }} /></button>

        <div className="w-px h-3 bg-white/10 mx-1" />

        <button onClick={() => execCmd('justifyLeft')} className={btnClass} title="Align Left"><AlignLeft size={13} style={{ color: theme.textoPrincipal }} /></button>
        <button onClick={() => execCmd('justifyCenter')} className={btnClass} title="Align Center"><AlignCenter size={13} style={{ color: theme.textoPrincipal }} /></button>
        <button onClick={() => execCmd('justifyRight')} className={btnClass} title="Align Right"><AlignRight size={13} style={{ color: theme.textoPrincipal }} /></button>
        <button onClick={() => execCmd('justifyFull')} className={btnClass} title="Justify"><AlignJustify size={13} style={{ color: theme.textoPrincipal }} /></button>

        <div className="w-px h-3 bg-white/10 mx-1" />

        <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-md border border-white/5" title="Text Color">
           <span className="text-[9px] font-bold opacity-50 select-none" style={{ color: theme.textoPrincipal }}>A</span>
           <input 
             type="color" 
             defaultValue="#ffffff"
             onChange={(e) => execCmd('foreColor', e.target.value)} 
             className="w-3.5 h-3.5 cursor-pointer outline-none bg-transparent rounded-sm" 
           />
        </div>

        <div className="flex-1" />

        <label className={`${btnClass} cursor-pointer gap-1.5 bg-white/5 border border-white/10 px-2`} title="Insert Image">
           <ImageIcon size={13} style={{ color: theme.textoPrincipal }} />
           <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.textoPrincipal }}>Image</span>
           <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* Editable Content */}
      <div 
        ref={editorRef}
        className="flex-1 p-4 outline-none overflow-y-auto text-sm rich-editor-content"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={{ 
          color: theme.textoPrincipal, 
          lineHeight: '1.7',
          minHeight: '160px'
        }}
      />
    </div>
  );
}
