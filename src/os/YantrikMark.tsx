/**
 * The product mark, as the OS draws it: `YantrikMark` in
 * crates/yantrik-ui-slint/ui/components/yantrik_mark.slint is an Image of the brand SVG, the
 * full emblem above 64px and the core (the Y, its channels, the bindu) at 64px and below,
 * because the gates, lattice and hairline rings turn to noise at a status-bar size.
 *
 * The SVGs in public/brand/ are copied from yantrik-os/brand/, which generates them
 * (brand/build.py) — nothing here redraws the mark. If it changes, it changes there, and the
 * files are re-copied; that is the only direction the change travels.
 */
export function YantrikMark({ size = 20, className = "" }: { size?: number; className?: string }) {
  const src = size > 64 ? "/brand/yantrik-emblem.svg" : "/brand/yantrik-mark.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a static SVG, not a photo to optimise
    <img src={src} width={size} height={size} alt="Yantrik OS" className={className} draggable={false} />
  );
}

export default YantrikMark;
