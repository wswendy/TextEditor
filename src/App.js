import React, { useState } from "react";

const initialLines = [
  { text: "", tag: "p", bold: false, italic: false, color: "", link: "" },
];

export default function App() {
  const [lines, setLines] = useState(initialLines);
  const [htmlOutput, setHtmlOutput] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const generateHtml = (data) => {
    // 將每個 block 以兩個換行分隔，方便原始碼閱讀與結構分段
    const html = data
      .map((line) => {
        if (line.tag === "img") {
          return line.url
            ? `<img src="${line.url}" alt="${line.alt || ""}" />`
            : "";
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
            .map((i) => `<li>${i}</li>`)
            .join("");
          return `<${line.tag}>${items}</${line.tag}>`;
        }

        const paragraphs = content
          .split("\n")
          .filter((p) => p.trim())
          .join("<br>");

        return `<${line.tag}>${paragraphs}</${line.tag}>`;
      })
      .join("\n\n"); // 兩個換行分隔每段

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

  const addLine = () => {
    const updated = [
      ...lines,
      { text: "", tag: "p", bold: false, italic: false, color: "", link: "" },
    ];
    setLines(updated);
    generateHtml(updated);
  };

  const addImageLine = () => {
    const updated = [...lines, { text: "", tag: "img", url: "", alt: "" }];
    setLines(updated);
    generateHtml(updated);
  };

  const getHtml = () => generateHtml(lines);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlOutput).then(
      () => setCopySuccess("已複製!"),
      () => setCopySuccess("複製失敗")
    );
    setTimeout(() => setCopySuccess(""), 2000);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>簡易 HTML 編輯器（逐行輸入）</h2>
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
          {line.tag === "img" ? (
            <>
              <input
                style={{ width: 180 }}
                placeholder="圖片 URL"
                value={line.url}
                onChange={(e) => updateLine(index, "url", e.target.value)}
              />
              <input
                placeholder="替代文字"
                value={line.alt}
                onChange={(e) => updateLine(index, "alt", e.target.value)}
              />
            </>
          ) : (
            <>
              <textarea
                style={{ flex: 1, minHeight: 60 }}
                placeholder="輸入文字內容，可用 \n 分段"
                value={line.text}
                onChange={(e) => updateLine(index, "text", e.target.value)}
              />
              <select
                value={line.tag}
                onChange={(e) => updateLine(index, "tag", e.target.value)}
              >
                <option value="p">段落</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
                <option value="ul">UL 清單</option>
                <option value="ol">OL 清單</option>
              </select>
            </>
          )}

          <button
            onClick={() => moveLine(index, index - 1)}
            disabled={index === 0}
          >
            ↑
          </button>
          <button
            onClick={() => moveLine(index, index + 1)}
            disabled={index === lines.length - 1}
          >
            ↓
          </button>
          <button onClick={() => deleteLine(index)}>🗑</button>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <button onClick={addLine}>+ 新增文字行</button>
        <button onClick={addImageLine} style={{ marginLeft: 8 }}>
          + 新增圖片行
        </button>
        <button onClick={getHtml} style={{ marginLeft: 8 }}>
          輸出 HTML
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>預覽：</h3>
        <div
          style={{
            padding: 10,
            border: "1px solid #ccc",
            background: "#fafafa",
          }}
          dangerouslySetInnerHTML={{ __html: htmlOutput }}
        />
        <h3>HTML 原始碼：</h3>
        <button onClick={copyToClipboard} style={{ marginBottom: 8 }}>
          複製原始碼
        </button>
        <span>{copySuccess}</span>
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
      </div>
    </div>
  );
}
