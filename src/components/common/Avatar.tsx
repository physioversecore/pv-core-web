import { useState } from "react";

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop&q=80",
];

function hashName(name: string): number {
  return Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0));
}

export function Avatar({ name, size = 40, src }: { name: string; size?: number; src?: string }) {
  const [imgError, setImgError] = useState(false);
  const showImg = src && !imgError;

  if (showImg) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  const fallback = FALLBACK_PHOTOS[hashName(name) % FALLBACK_PHOTOS.length];

  return (
    <img
      src={fallback}
      alt={name}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
