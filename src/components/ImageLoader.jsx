import { useEffect, useMemo, useState } from "react";
import { getAssetCandidates, resolveImagePath } from "../services/api";

export default function ImageLoader({
  src,
  alt = "",
  fallback = null,
  className,
  style,
  loading = "lazy",
  ...props
}) {
  const candidates = useMemo(() => getAssetCandidates(resolveImagePath(src)), [src]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [candidates[0]]);

  const currentSrc = candidates[index] || "";

  if (!currentSrc || failed) {
    if (fallback) return fallback;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f8f4",
          color: "#6b7280",
          overflow: "hidden",
        }}
        aria-label={alt || "Missing image"}
        role="img"
      >
        <span aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      data-fallback-index={index}
      onError={() => {
        const next = index + 1;
        if (next < candidates.length) {
          setIndex(next);
          return;
        }
        console.warn("Missing image:", currentSrc);
        setFailed(true);
      }}
      {...props}
    />
  );
}
