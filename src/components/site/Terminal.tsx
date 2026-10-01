import type { ReactNode } from "react";

/**
 * Machine output, in mono 13: a title bar naming the command (or the file), an optional note on
 * when and where it ran, then the lines exactly as the machine printed them.
 */
export function Terminal({
  title,
  meta,
  children,
  nowrap = false,
  label,
}: {
  title: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  nowrap?: boolean;
  /** For a <pre> that scrolls on its own: what it is, to a screen reader. */
  label?: string;
}) {
  return (
    <figure className="s-term">
      <figcaption className="s-term-bar">
        <span className="s-term-title">{title}</span>
        {meta ? <span className="s-term-meta">{meta}</span> : null}
      </figcaption>
      <pre data-nowrap={nowrap || undefined} tabIndex={nowrap ? 0 : undefined} aria-label={nowrap ? label : undefined}>
        <code>{children}</code>
      </pre>
    </figure>
  );
}

/** A command line as a person types it: a dim prompt that copy-and-paste leaves behind. */
export function Cmd({ children, prompt = "$" }: { children: ReactNode; prompt?: string }) {
  return (
    <>
      <span className="t-prompt">{prompt} </span>
      <span className="t-cmd">{children}</span>
      {"\n"}
    </>
  );
}
