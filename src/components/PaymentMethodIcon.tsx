"use client";

import { useId } from "react";

/**
 * Original brand marks for the payment methods. Each mark is an inline SVG so
 * no external assets are required. Falls back to a neutral tile for unknown
 * method ids (custom methods added from the admin panel).
 */

interface PaymentMethodIconProps {
  id: string;
  size?: number;
  className?: string;
}

const TILE_TEXT: React.CSSProperties = {
  fontFamily: "Manrope, system-ui, sans-serif",
  fontWeight: 800,
  textAnchor: "middle",
  dominantBaseline: "central",
};

export function PaymentMethodIcon({ id, size = 22, className }: PaymentMethodIconProps) {
  const gid = useId().replace(/:/g, "");
  const key = (id || "").toLowerCase();

  switch (key) {
    case "esewa":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#00A651" />
          <text x="24" y="25" fontSize="26" fill="#fff" style={TILE_TEXT}>
            e
          </text>
          <rect x="18" y="28" width="13" height="3.5" rx="1.75" fill="#fff" opacity="0.9" />
        </svg>
      );

    case "khalti":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`kg-${gid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5C2D91" />
              <stop offset="1" stopColor="#EC008C" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill={`url(#kg-${gid})`} />
          <text x="24" y="25" fontSize="27" fill="#fff" style={TILE_TEXT}>
            k
          </text>
          <circle cx="31.5" cy="32" r="3" fill="#fff" opacity="0.9" />
        </svg>
      );

    case "connectips":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#20508F" />
          <text x="24" y="25" fontSize="26" fill="#fff" style={TILE_TEXT}>
            C
          </text>
        </svg>
      );

    case "fonepay":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#E8590C" />
          <rect
            x="19.5"
            y="9"
            width="11"
            height="30"
            rx="2.5"
            fill="#fff"
            opacity="0.95"
            transform="rotate(-8 25 24)"
          />
          <circle cx="25" cy="33" r="1.6" fill="#E8590C" />
        </svg>
      );

    case "cash":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#68736F" />
          <rect
            x="12"
            y="15"
            width="24"
            height="18"
            rx="2.5"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
          />
          <circle cx="24" cy="24" r="4" fill="none" stroke="#fff" strokeWidth="2.2" />
        </svg>
      );

    case "card":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#1A1F71" />
          <rect x="11" y="14" width="26" height="20" rx="2.5" fill="#fff" />
          <rect x="11" y="18" width="26" height="5" fill="#C8102E" />
          <rect x="12.5" y="27" width="6" height="3" rx="1.2" fill="#F79E1B" />
        </svg>
      );

    case "paypal":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#003087" />
          <text
            x="24"
            y="26"
            fontSize="22"
            fill="#fff"
            style={{ ...TILE_TEXT, fontStyle: "italic" }}
          >
            PP
          </text>
          <rect x="18" y="29" width="14" height="2.6" rx="1.3" fill="#00A0DF" />
        </svg>
      );

    case "googlepay":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="20" fill="#fff" />
          {[
            ["#4285F4", 24, 24, 180, 90],
            ["#EA4335", 24, 24, 270, 360],
            ["#FBBC04", 24, 24, 90, 180],
            ["#34A853", 24, 24, 0, 90],
          ].map(([c, cx, cy, a1, a2], i) => (
            <path
              key={i}
              d={describeArc(Number(cx), Number(cy), 17, Number(a1), Number(a2))}
              fill={String(c)}
            />
          ))}
          <text x="24" y="26" fontSize="20" fill="#fff" style={TILE_TEXT}>
            G
          </text>
        </svg>
      );

    case "applepay":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <text x="24" y="26" fontSize="14" fill="#000" style={{ ...TILE_TEXT, fontWeight: 600 }}>
            Pay
          </text>
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={className}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#ECEFE9" />
          <rect x="14" y="14" width="20" height="18" rx="3" fill="#4F5A56" />
          <rect x="18" y="20" width="12" height="2.4" rx="1.2" fill="#C9CFCB" />
          <circle cx="24" cy="27" r="2.4" fill="#C9CFCB" />
        </svg>
      );
  }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
