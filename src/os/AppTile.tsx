import { Icon } from "./Icon";
import { APP_HUES, INK_HUES } from "./app-identity";
import { appOrWindow } from "./icons";
import { ring, v } from "./css";

export type AppTileProps = {
  /** The shell's app id (`files`, `notes`, `mind-view` …). */
  appId: string;
  /** The glyph's path commands; default `Icons.app-or-window(appId)`. */
  glyph?: string;
  /** A real icon image from the icon theme, which wins over the glyph. */
  iconSrc?: string;
  size?: number;
  hovered?: boolean;
  /** Drawn quieter: the taskbar's windows that do not have focus. */
  dimmed?: boolean;
};

/**
 * An app's icon as a solid tile in the app's own colour: AppTile in
 * crates/yantrik-ui-kit/slint/app_tile.slint, with its colour from `AppColor.hue-for-app`
 * (app_color.slint, generated into app-identity.ts and the --y-app-* tokens).
 *
 * Our app: the solid tile with the glyph in the colour that reads on it. An app with a real icon:
 * a quiet `bg-elevated` tile with the image. Anything else (Mind View): the same quiet tile with
 * the glyph in `text-secondary`. Corner radius 0.26 of the size; glyph 0.54 of it.
 */
export function AppTile({ appId, glyph, iconSrc, size = 44, hovered = false, dimmed = false }: AppTileProps) {
  const hue = APP_HUES[appId] ?? "";
  const coloured = hue !== "" && !iconSrc;
  const base = coloured ? v(`app-tile-${hue}`) : v("bg-elevated");
  // Slint's `brighter(8%)` / `brighter(6%)` on hover, approximated by mixing toward white.
  const fill = hovered ? `color-mix(in srgb, ${base} ${coloured ? 92 : 94}%, white)` : base;
  const glyphTint = coloured ? (INK_HUES.has(hue) ? v("app-tile-ink") : "#ffffff" /* app_color.slint:204 */) : v("text-secondary");
  const glyphSize = size * 0.54;
  return (
    <span
      style={{
        position: "relative",
        width: size,
        height: size,
        flex: "none",
        borderRadius: size * 0.26,
        background: fill,
        // The hairline: a light rim on a coloured tile in the dark theme (app_tile.slint:54).
        boxShadow: ring(coloured ? "#ffffff30" /* app_tile.slint:54 */ : v("border-card")),
        opacity: dimmed ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconSrc} alt="" width={size * 0.66} height={size * 0.66} style={{ objectFit: "contain" }} />
      ) : (
        <Icon
          d={glyph ?? appOrWindow(appId)}
          size={glyphSize}
          tint={glyphTint}
          thickness={size <= 24 ? 1.5 : size < 34 ? 1.8 : 2}
        />
      )}
    </span>
  );
}
