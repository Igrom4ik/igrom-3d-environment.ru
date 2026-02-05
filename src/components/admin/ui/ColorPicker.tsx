"use client";

import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  presetColors?: string[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  presetColors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
    "#FFFF00", "#00FFFF", "#FF00FF", "#C0C0C0", "#808080", 
    "#800000", "#808000", "#008000", "#800080", "#008080", "#000080"
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--neutral-strong)",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: "5px",
            background: "var(--neutral-alpha-weak)",
            borderRadius: "var(--radius-s)",
            border: "1px solid var(--neutral-alpha-medium)",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "4px",
              backgroundColor: value,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--neutral-strong)",
              fontFamily: "monospace",
              fontSize: "14px",
              width: "100%",
              outline: "none",
            }}
          />
        </div>

        {isOpen && (
          <div
            ref={popoverRef}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 100,
              marginTop: "8px",
              padding: "16px",
              background: "var(--neutral-background)",
              borderRadius: "var(--radius-m)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              border: "1px solid var(--neutral-alpha-medium)",
            }}
          >
            <HexColorPicker color={value} onChange={onChange} />
            
            <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px", width: "200px" }}>
              {presetColors.map((preset) => (
                <div
                  key={preset}
                  onClick={() => onChange(preset)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    backgroundColor: preset,
                    cursor: "pointer",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                  title={preset}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
