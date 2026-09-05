import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..", "dist");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function relativeUrl(fromFile, toFile) {
  return path.relative(path.dirname(fromFile), toFile).split(path.sep).join("/");
}

function localHref(fromFile, href) {
  let url;
  try {
    url = new URL(href.replaceAll("&amp;", "&"));
  } catch {
    return href;
  }
  if (url.hostname !== "www.hannerup-kirke.dk") return href;

  let target;
  if (url.pathname === "/cal/begivenhed" && url.searchParams.has("NewsPi1_60[currentPage]")) {
    const page = url.searchParams.get("NewsPi1_60[currentPage]");
    target = path.join(root, "cal", page === "1" ? "begivenhed.html" : `begivenhed-side-${page}.html`);
  } else {
    const pathname = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, "");
    const direct = path.join(root, pathname || "index.html");
    const candidates = [direct, `${direct}.html`, path.join(direct, "index.html")];
    target = candidates.find((candidate) => fs.existsSync(candidate));
  }

  if (!target || !fs.existsSync(target)) return href;
  return `${relativeUrl(fromFile, target)}${url.hash}`;
}

const filesWithQueries = walk(root).filter((file) => path.basename(file).includes("?"));
const replacements = [];

for (const oldPath of filesWithQueries) {
  const oldName = path.basename(oldPath);
  let newName;

  if (oldName.startsWith("begivenhed?")) {
    const pageMatch = oldName.match(/currentPage\]=(\d+)/);
    if (!pageMatch) throw new Error(`Kan ikke aflæse kalenderside: ${oldName}`);
    newName = pageMatch[1] === "1" ? "begivenhed.html" : `begivenhed-side-${pageMatch[1]}.html`;
  } else {
    newName = oldName.slice(0, oldName.indexOf("?"));
  }

  const newPath = path.join(path.dirname(oldPath), newName);
  const htmlEncodedName = oldName.replace("?", "%3F").replaceAll("&", "&amp;");
  replacements.push([htmlEncodedName, newName], [oldName, newName]);

  if (fs.existsSync(newPath)) {
    fs.unlinkSync(oldPath);
  } else {
    fs.renameSync(oldPath, newPath);
  }
}

const textExtensions = new Set([".html", ".css", ".js", ".svg", ".xml", ".txt"]);
for (const file of walk(root)) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  let source = fs.readFileSync(file, "utf8");

  for (const [from, to] of replacements) {
    source = source.replaceAll(from, to);
  }

  if (path.extname(file).toLowerCase() === ".html") {
    const previewCss = relativeUrl(file, path.join(root, "clone", "preview.css"));
    const previewJs = relativeUrl(file, path.join(root, "clone", "preview.js"));
    const favicon = relativeUrl(
      file,
      path.join(root, "fileadmin", "group", "811", "Redesign", "hannerupkirke-logo-ny.svg"),
    );

    source = source.replace(/href="(https:\/\/www\.hannerup-kirke\.dk\/[^"<>]*)"/gi, (_, href) => {
      return `href="${localHref(file, href)}"`;
    });

    source = source
      .replace(/<link rel="(?:shortcut icon|icon)"[^>]*>\s*/gi, "")
      .replace(/<meta name="robots" content="noindex,nofollow">\s*/gi, "")
      .replace(/<link rel="stylesheet" href="[^"]*clone\/preview\.css">\s*/gi, "")
      .replace(/<script src="[^"]*clone\/preview\.js"><\/script>\s*/gi, "")
      .replace(
        /<meta name="generator"[^>]*>/i,
        `$&\n<meta name="robots" content="noindex,nofollow">\n<link rel="icon" href="${favicon}" type="image/svg+xml">\n<link rel="stylesheet" href="${previewCss}">`,
      )
      .replace(/<\/body>/i, `<script src="${previewJs}"></script>\n</body>`);
  }

  fs.writeFileSync(file, source);
}

console.log(`Forberedte ${walk(root).filter((file) => file.endsWith(".html")).length} HTML-sider.`);
