import { Section } from "@/components/site/Section";
import { osLink, OS_COMMIT_SHORT } from "@/lib/os-repo";
import index from "@/data/docs-index.json";

/**
 * The OS's docs folder as a tree, grouped by what the reader is doing, each line a link to the
 * file at the pinned commit. The titles are the files' own first headings (src/data/docs-index.json).
 */
export function DocsSection() {
  return (
    <Section
      id="docs"
      route="yantrikos.com/docs"
      routeHref="/docs"
      title="The manual is the repository’s own docs folder, in the order you need it."
      more={{ href: "/docs", label: "What the Docs page will hold" }}
      art={
        <figure className="s-term docs-tree">
          <figcaption className="s-term-bar">
            <span className="s-term-title">docs/</span>
            <span className="s-term-meta">yantrik-os @ {OS_COMMIT_SHORT}</span>
          </figcaption>
          <div className="docs-body">
            {index.journeys.map((j) => (
              <div key={j.name} className="docs-group">
                <h3 className="docs-journey">{j.name}</h3>
                <ul>
                  {j.files.map((f, i) => (
                    <li key={f.path}>
                      <span className="t-prompt" aria-hidden="true">
                        {i === j.files.length - 1 ? "└─ " : "├─ "}
                      </span>
                      <a href={osLink(f.path)}>
                        <span className="docs-path">{f.path.replace(/^docs\//, "")}</span>
                        <span className="docs-title">{f.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </figure>
      }
    >
      <div className="s-prose">
        <p>
          The documentation is not rewritten for the website. It is the <code className="s-code">docs/</code> folder of
          the OS repository, the same files a contributor reads, grouped here by what you are trying to do: start, drive
          the desktop, build a surface for your own program, attach a mind, or look something up.
        </p>
        <p>
          Until the Docs page renders them, each line opens the file on GitHub at the commit this site was checked
          against.
        </p>
      </div>
    </Section>
  );
}
