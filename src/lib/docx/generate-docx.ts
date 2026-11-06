"use client";

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  PageNumber,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const BRAND = "ZENTRIX AI";
const PAGE_WIDTH = 9360;

function safeFilename(value: string): string {
  const cleaned = value
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

  return (cleaned || "zentrix-document") + ".docx";
}

function cleanInline(value: string): string {
  return value
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$1")
    .replace(/\\\(([\s\S]*?)\\\)/g, "$1")
    .replace(/\\([a-zA-Z]+)\{([^}]*)\}/g, "$2")
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .replace(/\\([{}%_#&])/g, "$1");
}

function parseInline(value: string): TextRun[] {
  const text = cleanInline(value);
  const runs: TextRun[] = [];

  const pattern =
    /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\x60[^\x60]+\x60)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(
        new TextRun(text.slice(lastIndex, match.index)),
      );
    }

    const token = match[0];

    if (token.startsWith("**") || token.startsWith("__")) {
      runs.push(
        new TextRun({
          text: token.slice(2, -2),
          bold: true,
        }),
      );
    } else if (token.startsWith("`")) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          font: "Courier New",
          color: "7C3AED",
        }),
      );
    } else {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          italics: true,
        }),
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    runs.push(new TextRun(text.slice(lastIndex)));
  }

  return runs.length ? runs : [new TextRun("")];
}

function paragraph(
  text: string,
  options: {
    bold?: boolean;
    italics?: boolean;
    color?: string;
    alignment?: typeof AlignmentType.CENTER;
    indent?: number;
    spacingAfter?: number;
  } = {},
): Paragraph {
  return new Paragraph({
    children:
      options.bold || options.italics || options.color
        ? [
            new TextRun({
              text: cleanInline(text),
              bold: options.bold,
              italics: options.italics,
              color: options.color,
            }),
          ]
        : parseInline(text),

    alignment: options.alignment,

    indent: options.indent
      ? { left: options.indent }
      : undefined,

    spacing: {
      after: options.spacingAfter ?? 140,
      line: 300,
    },
  });
}

function isTableRow(line: string): boolean {
  return (
    line.trim().startsWith("|") &&
    line.trim().endsWith("|")
  );
}

function parseTable(lines: string[]): Table {
  const rows = lines
    .filter(
      (line) =>
        !/^\|?\s*:?-{3,}/.test(
          line.replace(/\|/g, "").trim(),
        ),
    )
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );

  const columnCount = Math.max(
    1,
    ...rows.map((row) => row.length),
  );

  const cellWidth = Math.floor(
    PAGE_WIDTH / columnCount,
  );

  const border = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "D8DCE8",
  };

  return new Table({
    width: {
      size: PAGE_WIDTH,
      type: WidthType.DXA,
    },

    columnWidths: Array(columnCount).fill(cellWidth),

    rows: rows.map(
      (row, rowIndex) =>
        new TableRow({
          children: Array.from(
            { length: columnCount },
            (_, columnIndex) => {
              const value = row[columnIndex] ?? "";

              return new TableCell({
                width: {
                  size: cellWidth,
                  type: WidthType.DXA,
                },

                shading:
                  rowIndex === 0
                    ? { fill: "EEEAFE" }
                    : undefined,

                margins: {
                  top: 100,
                  bottom: 100,
                  left: 120,
                  right: 120,
                },

                borders: {
                  top: border,
                  bottom: border,
                  left: border,
                  right: border,
                },

                children: [
                  new Paragraph({
                    children:
                      rowIndex === 0
                        ? [
                            new TextRun({
                              text: cleanInline(value),
                              bold: true,
                              color: "34206D",
                            }),
                          ]
                        : parseInline(value),

                    spacing: { after: 40 },
                  }),
                ],
              });
            },
          ),
        }),
    ),
  });
}

function markdownToBlocks(
  content: string,
): Array<Paragraph | Table> {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n");

  const blocks: Array<Paragraph | Table> = [];

  let index = 0;
  let inCodeBlock = false;

  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();

    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      index++;
      continue;
    }

    if (!line) {
      index++;
      continue;
    }

    if (!inCodeBlock && isTableRow(line)) {
      const tableLines: string[] = [];

      while (
        index < lines.length &&
        isTableRow(lines[index].trim())
      ) {
        tableLines.push(lines[index].trim());
        index++;
      }

      blocks.push(parseTable(tableLines));

      blocks.push(
        new Paragraph({
          text: "",
          spacing: { after: 100 },
        }),
      );

      continue;
    }

    if (!inCodeBlock && /^#{1,3}\s+/.test(line)) {
      const match = line.match(
        /^(#{1,3})\s+(.*)$/,
      );

      if (match) {
        const level = match[1].length;

        const headingLevel =
          level === 1
            ? HeadingLevel.HEADING_1
            : level === 2
              ? HeadingLevel.HEADING_2
              : HeadingLevel.HEADING_3;

        blocks.push(
          new Paragraph({
            heading: headingLevel,
            children: parseInline(match[2]),

            spacing: {
              before: 260,
              after: 120,
            },
          }),
        );
      }

      index++;
      continue;
    }

    if (!inCodeBlock && /^>\s?/.test(line)) {
      blocks.push(
        paragraph(
          line.replace(/^>\s?/, ""),
          {
            italics: true,
            color: "5B6478",
            indent: 360,
            spacingAfter: 180,
          },
        ),
      );

      index++;
      continue;
    }

    // FIXED BULLET CONFIGURATION
    if (!inCodeBlock && /^[-*+]\s+/.test(line)) {
      blocks.push(
        new Paragraph({
          children: parseInline(
            line.replace(/^[-*+]\s+/, ""),
          ),

          bullet: {
            level: 0,
          },

          indent: {
            left: 720,
            hanging: 360,
          },

          spacing: {
            after: 80,
          },
        }),
      );

      index++;
      continue;
    }

    const numbered =
      !inCodeBlock &&
      line.match(/^(\d+)[.)]\s+(.*)$/);

    if (numbered) {
      blocks.push(
        paragraph(numbered[2], {
          indent: 360,
          spacingAfter: 90,
        }),
      );

      index++;
      continue;
    }

    if (inCodeBlock) {
      blocks.push(
        new Paragraph({
          children: [
            new TextRun({
              text: raw,
              font: "Courier New",
              size: 18,
              color: "334155",
            }),
          ],

          shading: {
            fill: "F1F5F9",
          },

          spacing: {
            after: 40,
          },
        }),
      );

      index++;
      continue;
    }

    const paragraphLines = [line];
    index++;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,3}\s+/.test(lines[index].trim()) &&
      !/^>\s?/.test(lines[index].trim()) &&
      !/^[-*+]\s+/.test(lines[index].trim()) &&
      !/^\d+[.)]\s+/.test(lines[index].trim()) &&
      !isTableRow(lines[index].trim()) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraphLines.push(lines[index].trim());
      index++;
    }

    blocks.push(
      paragraph(paragraphLines.join(" "), {
        spacingAfter: 160,
      }),
    );
  }

  return blocks;
}

export async function downloadMessageAsDocx(
  content: string,
  title = "ZENTRIX AI Document",
): Promise<void> {
  const cleanTitle =
    cleanInline(title).trim() ||
    "ZENTRIX AI Document";

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,

        children: [
          new TextRun({
            text: "Created with ZENTRIX AI  •  Page ",
            size: 18,
            color: "64748B",
          }),

          PageNumber.CURRENT,
        ],
      }),
    ],
  });

  const document = new Document({
    creator: BRAND,
    title: cleanTitle,

    description:
      "Editable document generated by ZENTRIX AI",

    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },

            margin: {
              top: 1440,
              right: 1275,
              bottom: 1440,
              left: 1275,
            },
          },
        },

        footers: {
          default: footer,
        },

        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,

            children: [
              new TextRun({
                text: BRAND,
                bold: true,
                size: 30,
                color: "6D28D9",
                characterSpacing: 24,
              }),
            ],

            spacing: {
              after: 80,
            },
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,

            children: [
              new TextRun({
                text:
                  "THINK BEYOND. BUILD WITHOUT LIMITS.",
                size: 16,
                color: "64748B",
                characterSpacing: 12,
              }),
            ],

            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 10,
                color: "8B5CF6",
                space: 8,
              },
            },

            spacing: {
              after: 360,
            },
          }),

          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,

            children: [
              new TextRun({
                text: cleanTitle,
                bold: true,
              }),
            ],

            spacing: {
              after: 300,
            },
          }),

          ...markdownToBlocks(content),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);

  const anchor =
    window.document.createElement("a");

  anchor.href = url;
  anchor.download = safeFilename(cleanTitle);

  window.document.body.appendChild(anchor);

  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
  }
