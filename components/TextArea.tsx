import { useState, useEffect, useRef } from "react"

const TextArea = ({ placeholder, value, handleChange }: { placeholder: string, value: string, handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) => {

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";

      const maxHeight = 160;
      if (textarea.scrollHeight <= maxHeight) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      } else {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      }
    }
  }, [value]);

  return (
    <textarea ref={textareaRef} value={value} placeholder={placeholder} onChange={handleChange} rows={1} className="resize-none no-scrollbar flex-1 bg-themeInputBg w-full rounded-2xl px-4 py-5 text-themeBlack placeholder:text-themeTextGray outline-none border-none"/>
  )
}

export default TextArea
