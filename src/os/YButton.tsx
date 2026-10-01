import { Icon } from "./Icon";
import { ring, text, v } from "./css";

export type YButtonProps = {
  /** 0 primary (accent), 1 secondary (bg-elevated, bordered), 2 ghost, 3 danger. */
  variant?: 0 | 1 | 2 | 3;
  /** 0 compact (28px), 1 regular (32px), 2 prominent (36px). */
  size?: 0 | 1 | 2;
  label?: string;
  iconPath?: string;
  iconTrailing?: boolean;
  iconOnly?: boolean;
  /**
   * Take an equal share of a row's spare width. Slint gives it to every item of a layout in
   * which none asks to stretch, which is how the Notes library's three buttons fill their row.
   */
  grow?: boolean;
};

/**
 * The kit's button at rest: YButton in crates/yantrik-ui-kit/slint/y_button.slint. r-md, the
 * label at 500 with 0.2px tracking, a 7px gap to a 13px (compact) or 15px icon at 1.7px.
 */
export function YButton({ variant = 0, size = 1, label = "", iconPath = "", iconTrailing = false, iconOnly = false, grow = false }: YButtonProps) {
  const height = size === 0 ? v("h-compact") : size === 2 ? v("h-prominent") : v("h-regular");
  const onAccent = variant === 0 || variant === 3;
  const fg = onAccent ? v("text-on-accent") : v("text-primary");
  const bg = variant === 3 ? v("color-danger") : variant === 2 ? "transparent" : variant === 1 ? v("bg-elevated") : v("accent");
  const glyph = size === 0 ? 13 : 15;
  const icon = iconPath ? <Icon d={iconPath} size={glyph} tint={fg} thickness={1.7} /> : null;
  const button = (
    <span
      style={{
        height,
        minWidth: iconOnly ? height : 64,
        width: iconOnly && !grow ? height : undefined,
        flex: grow ? "1 1 auto" : "none",
        boxSizing: "border-box",
        borderRadius: v("r-md"),
        background: bg,
        boxShadow: variant === 1 ? ring(v("border-default")) : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: iconOnly ? 0 : size === 0 ? "0 10px" : "0 12px",
      }}
    >
      {!iconTrailing ? icon : null}
      {!iconOnly ? (
        <span style={{ ...text(size === 0 ? v("fs-caption") : v("fs-body"), 500, fg), letterSpacing: 0.2, whiteSpace: "pre" }}>{label}</span>
      ) : null}
      {iconTrailing ? icon : null}
    </span>
  );
  // Growing from the button's own preferred width, min-width included: the wrapper's base size
  // is its child's max-content width, which honours the child's min-width as Slint's does.
  return grow ? <span style={{ display: "flex", flex: "1 1 auto" }}>{button}</span> : button;
}
