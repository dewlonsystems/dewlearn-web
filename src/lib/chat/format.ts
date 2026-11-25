const TOKEN =
  /\*\*(.+?)\*\*|`([^`]+)`|\*(?!\s)([^*]+?)\*|(https?:\/\/[^\s<]+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

function makeLink(url: string): Node {
  try {
    const u = new URL(url);
    const a = document.createElement("a");
    a.textContent = url;
    if (u.hostname === "dewlons.com" || u.hostname === "www.dewlons.com") {
      a.href = u.pathname + u.search + u.hash; // stay on our own site
    } else {
      a.href = u.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  } catch {
    return document.createTextNode(url);
  }
}

function appendInline(parent: HTMLElement, text: string): void {
  let last = 0;
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN.exec(text))) {
    if (m.index > last) parent.append(text.slice(last, m.index));
    let end = m.index + m[0].length;

    if (m[1] !== undefined) {
      const el = document.createElement("strong");
      el.textContent = m[1];
      parent.append(el);
    } else if (m[2] !== undefined) {
      const el = document.createElement("code");
      el.textContent = m[2];
      parent.append(el);
    } else if (m[3] !== undefined) {
      const el = document.createElement("em");
      el.textContent = m[3];
      parent.append(el);
    } else if (m[4] !== undefined) {
      const url = m[4].replace(/[.,;:!?)]+$/, ""); // keep trailing punctuation out of the link
      parent.append(makeLink(url));
      end = m.index + url.length;
      TOKEN.lastIndex = end;
    } else if (m[5] !== undefined) {
      const a = document.createElement("a");
      a.href = `mailto:${m[5]}`;
      a.textContent = m[5];
      parent.append(a);
    }
    last = end;
  }

  if (last < text.length) parent.append(text.slice(last));
}

export function renderRichText(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  let paragraph: string[] = [];
  let list: HTMLElement | null = null;
  let listType: "ul" | "ol" | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const p = document.createElement("p");
    paragraph.forEach((line, i) => {
      if (i) p.append(document.createElement("br"));
      appendInline(p, line);
    });
    frag.append(p);
    paragraph = [];
  };

  const flushList = () => {
    if (list) frag.append(list);
    list = null;
    listType = null;
  };

  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (!list || listType !== type) {
        flushList();
        list = document.createElement(type);
        listType = type;
      }
      const li = document.createElement("li");
      appendInline(li, (bullet ?? numbered)![1]);
      list.append(li);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line);
    }
  }

  flushParagraph();
  flushList();
  return frag;
}