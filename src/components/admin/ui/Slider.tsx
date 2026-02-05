"use client";

import React from "react";

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}) => {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--neutral-strong)",
            }}
          >
            {label}
          </label>
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--neutral-medium)",
              fontFamily: "monospace",
            }}
          >
            {value.toFixed(2)}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          height: "6px",
          background: "var(--neutral-alpha-medium)",
          borderRadius: "3px",
          outline: "none",
          appearance: "none",
          cursor: "pointer",
        }}
        className="custom-range-slider"
      />
      <style jsx>{`
        .custom-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--brand-solid-strong);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .custom-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .custom-range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--brand-solid-strong);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
