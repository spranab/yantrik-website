/**
 * The Yantrik OS mark.
 *
 * Inline SVG, not <img src="/brand/yantrik-mark.svg">, for three reasons: it is crisp at any
 * size without a second request, it can be animated or recoloured from CSS, and it cannot
 * show a broken-image box if a path goes wrong during a static export.
 *
 * The geometry is a transcription of yantrik-os/brand/yantrik-mark.svg, which is itself the
 * arithmetic of crates/yantrik-ui-slint/ui/components/yantrik_mark.slint carried out once at
 * mark-size: 128px. Do not adjust a number here. If the mark changes it changes in the OS
 * repo, `python3 brand/render.py` runs, public/brand/ is re-copied, and this file is updated
 * from the SVG — that is the only direction the change travels.
 *
 * The same file also lives at /brand/yantrik-mark.svg for anything that needs a URL.
 */
export default function YantrikMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      className={className}
      role="img"
      aria-label="Yantrik OS"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* The lit rim, by subtraction: teal disc, violet disc offset down-right over it, the
          dark sphere over the middle. What survives is a ring, teal on the upper-left
          shoulder and violet on the lower-right. */}
      <circle cx="64" cy="64" r="64" fill="#2fd4c4" />
      <circle cx="65.28" cy="65.28" r="62.72" fill="#8b5cf6" />
      <circle cx="64" cy="64" r="60.16" fill="#0d1420" />

      {/* Inside the glass. Barely there, on purpose: one hint that the sphere is round. */}
      <circle cx="52.48" cy="49.92" r="39.68" fill="#2fd4c4" fillOpacity="0.047059" />
      <circle cx="87.04" cy="92.16" r="28.16" fill="#8b5cf6" fillOpacity="0.047059" />

      {/* The Y: three strokes meeting off-centre at (64, 61.472). */}
      <g fill="none" strokeWidth="3.2" strokeLinecap="butt">
        <path d="M41.248 41.248L64 61.472" stroke="#2fd4c4" />
        <path d="M86.752 41.248L64 61.472" stroke="#5eb8ff" />
        <path d="M64 61.472L64 86.752" stroke="#3fc9ea" />
      </g>
    </svg>
  );
}
