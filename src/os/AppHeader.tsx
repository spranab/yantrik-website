import { Icon } from "./Icon";
import { WindowControls } from "./WindowControls";
import { YButton } from "./YButton";
import { APP_HUES } from "./app-identity";
import { ICONS } from "./icons";
import { alpha, elide, text, v } from "./css";

export type AppAction = { id: string; label: string; icon?: string; emphasis?: 0 | 1 | 2 | 3; active?: boolean };

export type AppHeaderProps = {
  width: number;
  title: string;
  subtitle?: string;
  /** The header glyph's path commands. */
  icon?: string;
  appId?: string;
  modified?: boolean;
  leadingActions?: AppAction[];
  actions?: AppAction[];
  /** A standalone app's own window bar: it carries the window controls. */
  windowBar?: boolean;
  maximized?: boolean;
};

const variantOf = (a: AppAction) => (a.active ? 0 : a.emphasis === 3 ? 3 : a.emphasis === 2 ? 0 : a.emphasis === 1 ? 1 : 2);

/**
 * Every app's header: AppHeader in crates/yantrik-ui-kit/slint/app_header.slint. 48px of
 * `bg-surface` with a 1px `separator` under it; the app's icon on a 32px tile of its own tint,
 * the title at title-2 (16/600, −0.2px) over the subtitle at fs-micro, the leading actions, then
 * the actions on the right (two inline under 900px wide, the rest behind "More", icon-only under
 * 720px), and the window controls at the full 48px.
 */
export function AppHeader({ width, title, subtitle = "", icon = "", appId = "", modified = false, leadingActions = [], actions = [], windowBar = false, maximized = false }: AppHeaderProps) {
  const hue = APP_HUES[appId] ?? "";
  const tint = hue ? v(`app-${hue}`) : v("accent");
  const tileBg = hue ? alpha(`app-${hue}`, 14) /* AppColor.tint-for-app: transparentize(0.86) */ : v("tint-accent");
  const inline = actions.length > 4 || width < 900 ? Math.min(2, actions.length) : actions.length;
  const overflow = actions.length > inline;
  const gap = width < 1000 ? v("sp-2") : v("sp-3");
  return (
    <div style={{ position: "relative", height: v("h-app-header"), width, background: v("bg-surface"), flex: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: v("separator") }} />
      <div style={{ display: "flex", alignItems: "center", gap, height: "100%", paddingLeft: v("sp-4"), paddingRight: windowBar ? 0 : v("sp-3") }}>
        {icon ? (
          <span style={{ width: 32, height: 32, borderRadius: v("r-sm"), background: tileBg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <Icon d={icon} size={16} tint={tint} thickness={1.7} />
          </span>
        ) : null}
        <span style={{ display: "flex", flexDirection: "column", gap: 1, width: Math.min(180, width * 0.2), flex: "none", minWidth: 0 }}>
          <span style={{ ...text(v("fs-title-2"), 600), letterSpacing: -0.2, ...elide }}>{title}</span>
          {subtitle ? <span style={{ ...text(v("fs-micro"), 400, v("text-secondary")), ...elide }}>{subtitle}</span> : null}
        </span>
        {modified ? <span style={{ width: 7, height: 7, borderRadius: 3.5, background: v("amber"), flex: "none" }} /> : null}
        {leadingActions.length ? (
          <span style={{ display: "flex", gap: v("sp-1"), flex: "none" }}>
            {leadingActions.map((a) => (
              <YButton key={a.id} label={a.label || a.id} iconPath={a.icon} iconOnly={!a.label} size={0} variant={variantOf(a)} />
            ))}
          </span>
        ) : null}
        <span style={{ flex: "1 1 0" }} />
        {actions.length ? (
          <span style={{ display: "flex", alignItems: "center", gap: v("sp-1"), flex: "none" }}>
            <span style={{ display: "flex", alignItems: "center" }}>
              {actions.slice(0, inline).map((a) => (
                <span key={a.id} style={{ paddingRight: v("sp-1") }}>
                  <YButton label={a.label || a.id} iconPath={a.icon} iconOnly={!a.label || (width < 720 && !!a.icon)} size={0} variant={variantOf(a)} />
                </span>
              ))}
            </span>
            {overflow ? <YButton label="More" iconPath={ICONS["chevron-down"]} iconTrailing variant={1} size={0} /> : null}
          </span>
        ) : null}
        {windowBar ? (
          <span style={{ alignSelf: "flex-start" }}>
            <WindowControls barHeight={48} maximized={maximized} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
