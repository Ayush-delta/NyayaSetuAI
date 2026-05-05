"use client";

export default function Loader({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="animate-spin text-foreground"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
