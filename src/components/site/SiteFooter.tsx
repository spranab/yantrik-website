import { YantrikMark } from "@/os/YantrikMark";
import { OS_COMMIT, OS_COMMIT_SHORT, OS_REPO, osLink } from "@/lib/os-repo";
import claims from "@/data/claims.json";

export function SiteFooter() {
  return (
    <footer className="s-footer">
      <div className="s-wrap s-footer-grid">
        <div>
          <p style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 12px", color: "var(--y-text-primary)", fontWeight: 600 }}>
            <YantrikMark size={22} />
            Yantrik OS
          </p>
          <p className="s-prose" style={{ margin: 0 }}>
            Every factual sentence on this site is kept in a register with the file in the OS repository that
            establishes it, and the build fails if that file is gone or the check is more than 60 days old.
          </p>
          <span className="s-src">
            {claims.claims.length} claims, checked against{" "}
            <a href={`${OS_REPO}/tree/${OS_COMMIT}`}>yantrik-os @ {OS_COMMIT_SHORT}</a>
          </span>
        </div>
        <nav aria-label="Elsewhere">
          <ul>
            <li>
              <a href={OS_REPO}>Source on GitHub</a>
            </li>
            <li>
              <a href={osLink("LICENSE")}>Licence: GPL-3.0</a>
            </li>
            <li>
              <a href={`${OS_REPO}/issues`}>Say what broke</a>
            </li>
            <li>
              <a href="https://discord.gg/7cDw3jd3Xf">Discord</a>
            </li>
            <li>
              <a href="https://iso.yantrikos.com/nightly/">Nightly images</a>
            </li>
            <li>
              <a href={osLink("design")}>The audits, in design/</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
