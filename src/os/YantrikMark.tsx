/**
 * The product mark as the status bar draws it: `YantrikMark` in
 * crates/yantrik-ui-slint/ui/components/yantrik_mark.slint, ported shape for shape. The rim is
 * made by subtraction (a teal disc, a violet one offset against it, a dark one over the middle),
 * then two faint glass hints and a Y of three 3.2px strokes.
 *
 * The colours are the literals of that file, cited by line, since the mark is drawn from its own
 * colours and not from the theme.
 */
export function YantrikMark({ size = 20 }: { size?: number }) {
  const s = size;
  // A disc as the OS's software renderer draws a rounded Rectangle: its edges snapped to whole
  // pixels (rounded), so at 20px the violet disc covers the teal one and the dark one leaves a
  // 1px violet ring, as the status bar shows on the machine.
  const disc = (fx: number, fy: number, fw: number, fill: string) => {
    const x0 = Math.round(fx * s), x1 = Math.round((fx + fw) * s);
    const y0 = Math.round(fy * s), y1 = Math.round((fy + fw) * s);
    return <ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={(x1 - x0) / 2} ry={(y1 - y0) / 2} style={{ fill }} />;
  };
  // The Y's Path element: x 0.29, y 0.28, width 0.42, height 0.44 of the mark, viewbox 20×20,
  // stroke 3.2px, fitted the way Slint fits a Path (see Icon.tsx).
  const box = { x: 0.29 * s, y: 0.28 * s, w: 0.42 * s, h: 0.44 * s };
  const sw = 3.2;
  const k = Math.max(Math.min(box.w - sw, box.h - sw), 0.01) / 20;
  const ox = box.x + sw / 2 + (box.w - sw - 20 * k) / 2;
  const oy = box.y + sw / 2 + (box.h - sw - 20 * k) / 2;
  const stroke = (d: string, color: string) => (
    <path d={d} style={{ fill: "none", stroke: color }} strokeWidth={sw / k} strokeLinecap="butt" />
  );
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" focusable="false" style={{ display: "block", flex: "none" }}>
      {/* yantrik_mark.slint ~47–70: the lit rim, by subtraction */}
      {disc(0, 0, 1, "#2fd4c4" /* yantrik_mark.slint:51 */)}
      {disc(0.02, 0.02, 0.98, "#8b5cf6" /* yantrik_mark.slint:59 */)}
      {disc(0.03, 0.03, 0.94, "#0d1420" /* yantrik_mark.slint:68 */)}
      {/* ~72–91: inside the glass */}
      {disc(0.1, 0.08, 0.62, "#2fd4c40c" /* yantrik_mark.slint:81 */)}
      {disc(0.46, 0.5, 0.44, "#8b5cf60c" /* yantrik_mark.slint:89 */)}
      {/* ~93–127: the Y */}
      <g transform={`translate(${ox} ${oy}) scale(${k})`}>
        {stroke("M 1 1 L 10 9", "#2fd4c4" /* yantrik_mark.slint:103 */)}
        {stroke("M 19 1 L 10 9", "#5eb8ff" /* yantrik_mark.slint:114 */)}
        {stroke("M 10 9 L 10 19", "#3fc9ea" /* yantrik_mark.slint:125 */)}
      </g>
    </svg>
  );
}
