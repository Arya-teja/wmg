interface BatikSVGPatternProps {
  className?: string;
  opacity?: number;
}

export default function BatikSVGPattern({
  className = "",
  opacity = 0.05,
}: BatikSVGPatternProps) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id="batikPattern"
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M30 5 Q35 15 30 25 Q25 15 30 5Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M10 30 Q20 25 30 30 Q20 35 10 30Z"
            fill="currentColor"
            opacity="0.4"
          />
          <path
            d="M50 30 Q40 25 30 30 Q40 35 50 30Z"
            fill="currentColor"
            opacity="0.4"
          />
          <path
            d="M30 35 Q35 45 30 55 Q25 45 30 35Z"
            fill="currentColor"
            opacity="0.6"
          />
          <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.7" />
          <circle cx="5" cy="5" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="55" cy="5" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="5" cy="55" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="55" cy="55" r="2" fill="currentColor" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#batikPattern)" />
    </svg>
  );
}
