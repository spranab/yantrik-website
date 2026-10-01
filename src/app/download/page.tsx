import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Claim, Claims, Source } from "@/components/site/Claim";
import { Cmd, Terminal } from "@/components/site/Terminal";
import { ReleaseBlock } from "@/components/site/ReleaseBlock";
import { getRelease } from "@/lib/release";

export const metadata: Metadata = {
  title: "Download · Yantrik OS",
  description:
    "Get the nightly Yantrik OS image, check its sha256, boot it in a VM, install it and update it. Every command is from the repository, and the hardware page says what has been measured and what has not.",
};

// Every command on this page is copied from a file in the OS repository at the pinned commit, and
// the file is named beside it. Where the doc writes a placeholder (<that file>, /dev/sdX), so does
// this page: it does not invent a value the doc does not give.

const STEPS = [
  ["current", "The current image"],
  ["get", "Get it"],
  ["verify", "Check it"],
  ["vm", "Boot it in a VM"],
  ["usb", "Or write a USB stick"],
  ["boot", "The boot menu"],
  ["install", "Install to a disk"],
  ["update", "Update it"],
  ["hardware", "Hardware: measured and not"],
] as const;

function Step({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="dl-step">
      <h2 id={`${id}-h`} className="s-h2 dl-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function installOutput() {
  const raw = readFileSync(join(process.cwd(), "src/data/captured/install-sh.txt"), "utf8").replace(/\r/g, "");
  const [head, ...rest] = raw.split("\n");
  const ranAt = /run (\S+Z)/.exec(head)?.[1] ?? "";
  return { ranAt, text: rest.join("\n").replace(/^\n/, "").replace(/\n+$/, "") };
}

export default async function Download() {
  const release = await getRelease();
  const out = installOutput();
  return (
    <SiteShell>
      <div className="s-wrap dl-top">
        <p className="s-route">yantrikos.com/download</p>
        <h1 className="s-display">Get it, check it, boot it.</h1>
        <p className="s-sub">
          Yantrik OS is one file: a live ISO you boot, and the desktop runs from it without touching a disk. The
          installer is inside the running desktop, for when you want it on one. Every command below is copied from the
          repository, with the file it is in.
        </p>
      </div>

      <div className="s-wrap dl-layout">
        <nav className="dl-index" aria-label="On this page">
          <ol>
            {STEPS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="dl-body">
          <Step id="current" title="The current image">
            <ReleaseBlock initial={release} />
            <div className="dl-claims">
              <Claims ids={["C-31", "C-32", "C-21"]} />
            </div>
          </Step>

          <Step id="get" title="Get it">
            <div className="s-prose">
              <p>
                The release host says which file is current in <code className="s-code">latest.json</code>. Four lines,
                and you can see every step:
              </p>
            </div>
            <Terminal title="by hand" meta="docs/getting-started.md, §1">
              <Cmd>
                curl -fsSL https://iso.yantrikos.com/nightly/latest.json{"          "}
                <span className="t-dim"># what the current file is called</span>
              </Cmd>
              <Cmd>curl -fL -O https://iso.yantrikos.com/nightly/&lt;that file&gt;</Cmd>
              <Cmd>curl -fL -O https://iso.yantrikos.com/nightly/&lt;that file&gt;.sha256</Cmd>
              <Cmd>sha256sum -c &lt;that file&gt;.sha256</Cmd>
            </Terminal>
            <Source paths={["docs/getting-started.md"]} />

            <div className="s-prose dl-gap">
              <p>
                Or let the repository&rsquo;s <code className="s-code">install.sh</code> read it for you. With no flag it
                only tells you; this is what it printed when it was run for this page:
              </p>
            </div>
            <Terminal title="sh install.sh" meta={`run ${out.ranAt.replace("T", " ").replace("Z", " UTC")}`}>
              <Cmd>sh install.sh</Cmd>
              {out.text}
            </Terminal>
            <span className="s-src">
              Unedited output, saved with the page as src/data/captured/install-sh.txt. Run it today and it names the
              image current then.
            </span>
            <div className="dl-claims">
              <Claim id="C-33" />
            </div>
            <Terminal title="the two ways to run it" meta="install.sh, its usage">
              <Cmd>sh install.sh</Cmd>
              <span className="t-dim"># what the current image is, and what to do with it</span>
              {"\n"}
              <Cmd>sh install.sh --download</Cmd>
              <span className="t-dim"># also fetch it into this directory and check its sha256</span>
              {"\n"}
              <Cmd>curl -fsSL https://get.yantrikos.com/install.sh | sh</Cmd>
              <span className="t-dim"># piped into a shell, it explains and does nothing else</span>
            </Terminal>
            <Source paths={["install.sh", "docs/getting-started.md"]} />
          </Step>

          <Step id="verify" title="Check it before you boot it">
            <div className="s-prose">
              <p>
                The point is not that someone is attacking you. It is that a 1.3 GiB download that ends at 98% gives you
                an image that boots halfway and fails in a way you will spend an afternoon on. (The image has grown since
                that sentence was written: <code className="s-code">latest.json</code> above has today&rsquo;s size.)
              </p>
            </div>
            <Terminal title="Linux" meta="docs/getting-started.md">
              <Cmd>sha256sum -c &lt;that file&gt;.sha256</Cmd>
            </Terminal>
            <div className="dl-gap-s" />
            <Terminal title="macOS" meta="install.sh, sha256_of">
              <Cmd>shasum -a 256 &lt;that file&gt;</Cmd>
              <span className="t-dim"># compare with the sha256 in latest.json</span>
            </Terminal>
            <Source paths={["docs/getting-started.md", "install.sh"]} />
          </Step>

          <Step id="vm" title="Boot it in a VM first">
            <div className="s-prose">
              <p>This is the recommended way to meet it, and what the project develops against.</p>
            </div>
            <Terminal title="QEMU" meta="docs/getting-started.md, §2">
              <Cmd>
                {"qemu-system-x86_64 -enable-kvm -m 4096 -smp 4 \\\n  -cdrom yantrik-os-<version>.iso -boot d \\\n  -device virtio-vga -display gtk"}
              </Cmd>
            </Terminal>
            <Source paths={["docs/getting-started.md", "docs/hardware-requirements.md"]} />

            <div className="s-pane dl-table-pane">
              <table className="s-table" data-stack>
                <caption className="dl-caption">What to give a VM</caption>
                <thead>
                  <tr>
                    <th scope="col" />
                    <th scope="col">known to work · measured</th>
                    <th scope="col">the least anyone has booted · CI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["CPU", "4 vCPU", "4 vCPU"],
                    ["RAM", "8 GB", "4 GB"],
                    ["Disk", "32 GB", "none, if you only boot live"],
                    ["GPU", "none needed", "none needed"],
                    ["Firmware", "BIOS", "BIOS"],
                  ].map(([k, a, b]) => (
                    <tr key={k}>
                      <th scope="row">{k}</th>
                      <td data-label="known to work">{a}</td>
                      <td data-label="least booted">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Source paths={["docs/hardware-requirements.md"]}>&ldquo;What to give a VM&rdquo;, from </Source>
            <div className="dl-claims">
              <Claim id="C-35" />
            </div>
            <div className="s-prose dl-gap">
              <p>
                <strong>Proxmox:</strong> set <code className="s-code">vga: virtio</code>. With Proxmox&rsquo;s default
                the machine boots, reports a healthy session, and shows a black screen forever, because there is no{" "}
                <code className="s-code">/dev/dri</code> for the compositor to find.
              </p>
              <p>
                <strong>VirtualBox</strong> ought to work and has not been checked against a current build. The settings
                the repository&rsquo;s own scripts give it are <em>configured, not measured</em>: 4 GB of RAM, EFI
                enabled, the VMSVGA graphics controller and 128 MB of video memory.
              </p>
            </div>
            <Source paths={["docs/getting-started.md", "deploy/yantrik-os/proxmox-deploy.sh", "deploy/yantrik-os/build-vbox-image.sh"]} />
          </Step>

          <Step id="usb" title="Or write it to a USB stick">
            <Terminal title="Linux and macOS" meta="docs/getting-started.md, §3">
              <span className="t-dim">
                {"# /dev/sdX is the DEVICE, not a partition. Getting it wrong overwrites\n# the wrong disk. `lsblk` on Linux, `diskutil list` on macOS (where it is /dev/rdiskN and\n# the stick must be unmounted first with `diskutil unmountDisk`).\n"}
              </span>
              <Cmd>sudo dd if=yantrik-os-&lt;version&gt;.iso of=/dev/sdX bs=4M status=progress conv=fsync</Cmd>
            </Terminal>
            <div className="s-prose dl-gap-s">
              <p>
                On Windows, Rufus (<a className="s-link" href="https://rufus.ie">rufus.ie</a>) or balenaEtcher (
                <a className="s-link" href="https://etcher.balena.io">etcher.balena.io</a>). All of them take the{" "}
                <code className="s-code">.iso</code> exactly as downloaded; do not unpack it.
              </p>
            </div>
            <Source paths={["docs/getting-started.md"]} />
          </Step>

          <Step id="boot" title="The boot menu">
            <div className="s-pane dl-table-pane">
              <table className="s-table" data-stack>
                <caption className="dl-caption">Four entries, and what each does</caption>
                <thead>
                  <tr>
                    <th scope="col">entry</th>
                    <th scope="col">what it does</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Install Yantrik OS", "Boots live and puts first-run setup into installer mode, so it offers to write to a disk at the end"],
                    ["Try Yantrik OS (live, no install)", "Boots live. Nothing offers to touch a disk"],
                    ["Install Yantrik OS (Safe Mode)", "The same as the first, with nomodeset: use this if the screen stays black"],
                    ["Try Yantrik OS (verbose, serial console)", "No quiet, so the kernel and systemd say what they are doing. The entry to boot when you are filing a bug"],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row">{k}</th>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Source paths={["docs/getting-started.md"]}>§4, from </Source>
            <div className="dl-claims">
              <Claims ids={["C-38", "C-34"]} />
            </div>
          </Step>

          <Step id="install" title="Install it to a disk">
            <div className="dl-warn">
              <Claim id="C-37" />
            </div>
            <div className="s-prose dl-gap">
              <p>
                Boot the &ldquo;Install Yantrik OS&rdquo; entry and first-run setup ends on the install screen. Or, in a
                terminal in the live session:
              </p>
            </div>
            <Terminal title="the text installer" meta="docs/getting-started.md, §6">
              <Cmd>sudo /opt/yantrik/bin/yantrik-install</Cmd>
            </Terminal>
            <div className="s-prose dl-gap-s">
              <p>
                The full path is needed: <code className="s-code">sudo</code> on Debian replaces your{" "}
                <code className="s-code">PATH</code> with its own, which does not include{" "}
                <code className="s-code">/opt/yantrik/bin</code>. It shows every answer and the disk together and waits
                for you to type <code className="s-code">yes</code>.
              </p>
            </div>
            <Source paths={["docs/getting-started.md", "deploy/yantrik-os/yantrik-install.sh"]} />
          </Step>

          <Step id="update" title="Update it">
            <Terminal title="yantrik-update" meta="docs/getting-started.md, §7">
              <Cmd>
                yantrik-update check{"        "}
                <span className="t-dim"># what is installed, versus what the channel has</span>
              </Cmd>
              <Cmd>
                yantrik-update apply{"        "}
                <span className="t-dim"># download, verify, install, restart the session</span>
              </Cmd>
              <Cmd>
                yantrik-update rollback{"     "}
                <span className="t-dim"># restore the previous build</span>
              </Cmd>
              <Cmd>
                yantrik-update status{"       "}
                <span className="t-dim"># channel, host, current build, backups on disk</span>
              </Cmd>
            </Terminal>
            <div className="dl-claims">
              <Claim id="C-20" />
            </div>
          </Step>

          <Step id="hardware" title="Hardware: what has been measured, and what has not">
            <div className="s-prose">
              <p>
                The OS&rsquo;s own hardware page labels every number <strong>measured</strong> (someone ran the command),{" "}
                <strong>configured</strong> (a value in a file you can read) or <strong>not measured</strong> (nobody has
                checked, so no figure is given). This page keeps the labels.
              </p>
            </div>
            <div className="s-pane dl-table-pane">
              <table className="s-table hw" data-stack>
                <caption className="dl-caption">What it has been run on</caption>
                <thead>
                  <tr>
                    <th scope="col" />
                    <th scope="col">the project&rsquo;s test machine</th>
                    <th scope="col">CI&rsquo;s boot test, every image</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["label", "measured, 2026-09-22", "configured, boottest.py"],
                    ["platform", "QEMU/KVM, Q35 + ICH9, SeaBIOS", "QEMU, KVM when the runner has it"],
                    ["CPU", "4 cores", "4"],
                    ["RAM", "7.8 GiB (provisioned 8 GB)", "4096 MB"],
                    ["GPU", "none: virtio-gpu, Mesa llvmpipe", "none: virtio-vga, headless"],
                    ["disk", "32 GB", "none: it boots the live image"],
                    ["firmware", "BIOS", "BIOS"],
                  ].map(([k, a, b]) => (
                    <tr key={k} data-row={k}>
                      <th scope="row">{k}</th>
                      <td data-label="test machine">{a}</td>
                      <td data-label="CI boot test">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Source paths={["docs/hardware-requirements.md", "deploy/yantrik-os/boottest.py"]} />

            <div className="dl-notmeasured">
              <h3 className="s-h3">Not measured</h3>
              <Claim id="C-36" />
            </div>

            <div className="dl-gap">
              <Terminal title="what the whole desktop costs to run" meta="docs/footprint.md">
                {`process                     RSS MB    PSS MB
yantrik-ui                   181.2     177.9
a11y-service                   4.8       2.9
weather-service                4.4       2.5
network-service                4.0       2.1
                             -----     -----
TOTAL                        194.4     185.5`}
              </Terminal>
              <div className="dl-claims">
                <Claim id="C-22" />
              </div>
            </div>
          </Step>
        </div>
      </div>
    </SiteShell>
  );
}
