const path = require("node:path");

const RESPONSIVE_IMAGE_VARIANTS = new Map([
  ["/founder.jpeg", {
    avif: "/assets/people/founder.avif",
    webp: "/assets/people/founder.webp",
  }],
  ["/assets/people/executive-leader.jpg", {
    avif: "/assets/people/executive-leader.avif",
    webp: "/assets/people/executive-leader.webp",
  }],
  ["/assets/people/executive-professional.jpg", {
    avif: "/assets/people/executive-professional.avif",
    webp: "/assets/people/executive-professional.webp",
  }],
  ["/assets/people/executive-woman.jpg", {
    avif: "/assets/people/executive-woman.avif",
    webp: "/assets/people/executive-woman.webp",
  }],
  ["/assets/people/leadership-meeting.jpg", {
    avif: "/assets/people/leadership-meeting.avif",
    webp: "/assets/people/leadership-meeting.webp",
  }],
  ["/assets/people/leadership-team.jpg", {
    avif: "/assets/people/leadership-team.avif",
    webp: "/assets/people/leadership-team.webp",
  }],
]);

function getAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return tag.match(new RegExp(`\\b${escapedName}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2];
}

function getAssetPath(src, relativeHtmlPath) {
  if (!src) return undefined;
  const cleanSrc = src.split(/[?#]/, 1)[0];
  if (cleanSrc.startsWith("/")) return path.posix.normalize(cleanSrc);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relativeHtmlPath), cleanSrc));
  return `/${resolved.replace(/^\/+/, "")}`;
}

function isValidResponsivePicture(picture, relativeHtmlPath, expectedFallback) {
  const content = picture.match(/<picture\b[^>]*>([\s\S]*?)<\/picture\s*>/i)?.[1];
  if (content === undefined) return false;

  const images = content.match(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi) ?? [];
  const sources = content.match(/<source\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi) ?? [];
  if (images.length !== 1 || sources.length !== 2) return false;

  const fallback = getAssetPath(getAttribute(images[0], "src"), relativeHtmlPath);
  if (expectedFallback && fallback !== expectedFallback) return false;
  const variants = RESPONSIVE_IMAGE_VARIANTS.get(fallback);
  if (!variants) return false;

  const sourceTypes = new Map(sources.map((source) => [
    getAttribute(source, "type"),
    getAttribute(source, "srcset"),
  ]));
  return sourceTypes.get("image/avif") === variants.avif &&
    sourceTypes.get("image/webp") === variants.webp;
}

function normalizeResponsivePictures(markup, relativeHtmlPath) {
  const normalized = markup.replace(
    /<picture\b(?=[^>]*\bdata-kov-responsive-image\b)[^>]*>([\s\S]*?)<\/picture\s*>/gi,
    (picture) => {
      if (!isValidResponsivePicture(picture, relativeHtmlPath)) return picture;
      return picture.match(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/i)[0];
    },
  );
  if (relativeHtmlPath !== "index.html") return normalized;
  return normalized.replace(
    /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,
    (image) => {
      if (getAttribute(image, "src") !== "founder.jpeg" || getAttribute(image, "alt") !== "KOV Founder") {
        return image;
      }
      return image.replace(/(\bsrc\s*=\s*["'])founder\.jpeg(["'])/i, "$1FOUNDER HOME.jpeg$2");
    },
  );
}

function hasResponsivePicture(markup, relativeHtmlPath, fallback) {
  return [...markup.matchAll(/<picture\b(?=[^>]*\bdata-kov-responsive-image\b)[^>]*>[\s\S]*?<\/picture\s*>/gi)]
    .some(([picture]) => isValidResponsivePicture(picture, relativeHtmlPath, fallback));
}

function addResponsivePictureSources(markup, relativeHtmlPath) {
  if (relativeHtmlPath === "index.html") {
    markup = markup.replace(
      /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,
      (image) => {
        if (getAttribute(image, "src") !== "FOUNDER HOME.jpeg" || getAttribute(image, "alt") !== "KOV Founder") {
          return image;
        }
        return image.replace(/(\bsrc\s*=\s*["'])FOUNDER HOME\.jpeg(["'])/i, "$1founder.jpeg$2");
      },
    );
  }
  let added = 0;
  const updated = markup.replace(
    /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,
    (image, offset) => {
      const source = getAssetPath(getAttribute(image, "src"), relativeHtmlPath);
      const variants = RESPONSIVE_IMAGE_VARIANTS.get(source);
      if (!variants) return image;

      const prefix = markup.slice(0, offset);
      const pictureStart = prefix.lastIndexOf("<picture");
      const pictureEnd = prefix.lastIndexOf("</picture");
      if (pictureStart > pictureEnd) return image;

      added += 1;
      return [
        '<picture data-kov-responsive-image>',
        `  <source type="image/avif" srcset="${variants.avif}">`,
        `  <source type="image/webp" srcset="${variants.webp}">`,
        `  ${image}`,
        "</picture>",
      ].join("\n");
    },
  );
  return { markup: updated, added };
}

module.exports = {
  RESPONSIVE_IMAGE_VARIANTS,
  addResponsivePictureSources,
  hasResponsivePicture,
  normalizeResponsivePictures,
};
