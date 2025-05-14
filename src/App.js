import React, { useState } from "react";
import "./App.css";
const initialLines = [
  {
    text: "",
    tag: "paragraph",
    bold: false,
    italic: false,
    color: "",
    link: "",
  },
];

export default function App() {
  const [lines, setLines] = useState(initialLines);
  const [htmlOutput, setHtmlOutput] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [selectedTag, setSelectedTag] = useState("paragraph");
  const [isHTMLHidden, setIsHTMLHidden] = useState(true);

  const generateHtml = (data) => {
    const html = data
      .map((line) => {
        if (line.tag === "img") {
          return line.url
            ? `<div class="media-box"><img src="${line.url}" alt="${
                line.alt || ""
              }"/></div>`
            : "";
        }

        if (line.tag === "spacer") {
          return `<div style="height: 24px;"></div>`;
        }

        let content = line.text;

        // Markdown 連結 (支援 |_blank)
        content = content.replace(
          /\[([^\]|]+)(\|_blank)?\]\(([^\)]+)\)/g,
          (match, text, blank, url) => {
            const target = blank
              ? ' target="_blank" rel="noopener noreferrer"'
              : "";
            return `<a href="${url}"${target}>${text}</a>`;
          }
        );

        // 處理粗體、斜體、底線、顏色
        content = content
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/\*([^*]+)\*/g, "<em>$1</em>")
          .replace(/__([^_]+)__/g, "<u>$1</u>")
          .replace(
            /\{([^}]+)\}\((#[0-9a-fA-F]{3,6})\)/g,
            '<span style="color: $2">$1</span>'
          );

        if (line.tag === "ul" || line.tag === "ol") {
          const items = content
            .split("\n")
            .filter((i) => i.trim())
            .map((i) => `<li>${i}</li>`);

          if (items.length === 0) return "";

          return `<${line.tag} class="paragraph">${items.join("")}</${
            line.tag
          }>`;
        }

        const paragraphs = content
          .split("\n")
          .filter((p) => p.trim())
          .join("<br>");

        if (!paragraphs.trim()) return "";
        const renderers = {
          "tips-box": (p) =>
            `<div class="tips-box"><p class="paragraph">${p}</p></div>`,
          "info-box": (p) =>
            `<div class="info-box"><p class="paragraph">${p}</p></div>`,
          blockquote: (p) => `<div class="blockquote"><p>${p}</p></div>`,
          paragraph: (p) => `<p class="paragraph">${p}</p>`,
          h1: (p) => `<h1 class="h1-style">${p}</h1>`,
          h2: (p) => `<h2 class="h2-style">${p}</h2>`,
        };

        if (renderers[line.tag]) {
          return renderers[line.tag](paragraphs);
        }

        return `<${line.tag}>${paragraphs}</${line.tag}>`;
      })
      .join("\n\n");
    setHtmlOutput(html);
  };

  const updateLine = (index, key, value) => {
    const updated = [...lines];
    updated[index][key] = value;
    setLines(updated);
    generateHtml(updated);
  };

  const deleteLine = (index) => {
    const updated = lines.filter((_, i) => i !== index);
    setLines(updated);
    generateHtml(updated);
  };

  const moveLine = (from, to) => {
    if (to < 0 || to >= lines.length) return;
    const updated = [...lines];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setLines(updated);
    generateHtml(updated);
  };

  const addImage = () => {
    const updated = [...lines, { text: "", tag: "img", url: "", alt: "" }];
    setLines(updated);
    generateHtml(updated);
  };

  const addSpacer = () => {
    const updated = [...lines, { text: "", tag: "spacer", url: "", alt: "" }];
    setLines(updated);
    generateHtml(updated);
  };

  const addParagraphs = (tag) => {
    const updated = [
      ...lines,
      {
        text: "",
        tag: tag,
        bold: false,
        italic: false,
        color: "",
        link: "",
      },
    ];
    setLines(updated);
    generateHtml(updated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlOutput).then(
      () => setCopySuccess("已複製!"),
      () => setCopySuccess("複製失敗")
    );
    setTimeout(() => setCopySuccess(""), 2000);
  };

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          background: "#eef",
          padding: 10,
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        <div>
          <p>
            This is our <a href="https://akohub.com">website link</a>
          </p>
          <p>
            Open in a new tab:{" "}
            <code class="code">
              This is our [website link|_blank](https://akohub.com)
            </code>
          </p>
          <p>
            Open in the same tab:{" "}
            <code class="code">
              This is our [website link](https://akohub.com)
            </code>
          </p>
        </div>
        <hr />
        <div>
          <p>
            <b>Bold text</b>: <code class="code">**Bold text**</code>
          </p>
          <p>
            <i>Italic</i>: <code class="code">*Italic text*</code>
          </p>
          <p>
            <span style={{ textDecoration: "underline" }}>Underline</span>:{" "}
            <code class="code">__Underline text__</code>
          </p>
          <p>
            <span style={{ color: "#f00" }}>Text color</span>:{" "}
            <code class="code">{"{Text color}"}(#f00)</code>
          </p>
        </div>
      </div>
      <h2>Element Input</h2>
      {lines.map((line, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {(() => {
            switch (line.tag) {
              case "img":
                return (
                  <>
                    <input
                      style={{ width: 180 }}
                      placeholder="image url"
                      value={line.url}
                      onChange={(e) => updateLine(index, "url", e.target.value)}
                    />
                    <input
                      placeholder="image alt"
                      value={line.alt}
                      onChange={(e) => updateLine(index, "alt", e.target.value)}
                    />
                  </>
                );

              case "h1":
              case "h2":
                return (
                  <input
                    style={{ flex: 1 }}
                    placeholder="Enter your text here"
                    value={line.text}
                    onChange={(e) => updateLine(index, "text", e.target.value)}
                  />
                );

              case "spacer":
                return <div>It's a spacer</div>;

              default:
                return (
                  <textarea
                    style={{ flex: 1, minHeight: 60 }}
                    placeholder="Enter your text here"
                    value={line.text}
                    onChange={(e) => updateLine(index, "text", e.target.value)}
                  />
                );
            }
          })()}

          <button
            onClick={() => moveLine(index, index - 1)}
            disabled={index === 0}
          >
            ↑ Move up
          </button>
          <button
            onClick={() => moveLine(index, index + 1)}
            disabled={index === lines.length - 1}
          >
            ↓ Move down
          </button>
          <button onClick={() => deleteLine(index)}>🗑</button>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="paragraph">Paragraph</option>
            <option value="ul">UL list</option>
            <option value="ol">OL list</option>
            <option value="img">Image</option>
            <option value="info-box">Info Box</option>
            <option value="tips-box">Tips Box</option>
            <option value="blockquote">Blockquote</option>
            <option value="spacer">Spacer</option>
          </select>

          <button
            onClick={() => {
              if (selectedTag === "img") {
                addImage();
              } else if (selectedTag === "spacer") {
                addSpacer();
              } else {
                addParagraphs(selectedTag);
              }
            }}
          >
            ＋ Add
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Preview：</h3>
        <div
          style={{
            padding: 10,
            border: "1px solid #ccc",
            background: "#fff",
          }}
          dangerouslySetInnerHTML={{ __html: htmlOutput }}
        />
        <div>
          <h3>HTML Output</h3>
          <label>
            <input
              type="checkbox"
              checked={isHTMLHidden}
              onChange={(e) => setIsHTMLHidden(e.target.checked)}
            />
            Hide source code
          </label>
        </div>
        <button onClick={copyToClipboard} style={{ marginBottom: 8 }}>
          Copy HTML Code
        </button>
        <span>{copySuccess}</span>
        {!isHTMLHidden && (
          <textarea
            style={{
              width: "100%",
              minHeight: 200,
              background: "#f5f5f5",
              padding: 10,
              whiteSpace: "pre-wrap",
            }}
            readOnly
            value={htmlOutput}
          />
        )}
      </div>
    </div>
  );
}
