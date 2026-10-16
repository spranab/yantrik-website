import { Section } from "@/components/site/Section";
import data from "@/data/builds.json";

/** The live machine's programs, three of them as a strip, each a link to where it plays. */
export function BuiltSection() {
  const shown = ["orrery", "labyrinth", "sortbars"]
    .map((id) => data.builds.find((b) => b.id === id))
    .filter((b): b is (typeof data.builds)[number] => Boolean(b));
  return (
    <Section
      id="built"
      route="yantrikos.com/built"
      routeHref="/built"
      title="What it made on stream, played as it left it."
      more={{ href: "/built", label: `All ${data.builds.length} programs, with what works and what does not` }}
      art={
        <figure className="s-figure">
          <div className="built-strip">
            {shown.map((b) => (
              <a key={b.id} href={`/built#${b.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/built-thumbs/${b.id}.webp`} alt={`${b.name}, as the Mind built it`} width={880} height={576} loading="lazy" decoding="async" />
                <span>{b.name}</span>
              </a>
            ))}
          </div>
        </figure>
      }
    >
      <div className="s-prose">
        <p>
          Given a brief and nothing else, the Mind on the live machine plans a small program, builds it in a terminal of
          its own and checks the page loads. Each one is copied here byte for byte and plays in your browser, with what we
          found when we played it, bugs included.
        </p>
      </div>
    </Section>
  );
}
