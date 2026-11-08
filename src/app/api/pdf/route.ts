import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_EXTRACTED_CHARACTERS = 100000;

export async function POST(request: NextRequest) {
  let parser: PDFParse | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please attach a PDF file." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "PDF must be between 1 byte and 5 MB." },
        { status: 413 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 415 }
      );
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const signature = new TextDecoder().decode(
      bytes.slice(0, 5)
    );

    if (signature !== "%PDF-") {
      return NextResponse.json(
        { error: "This file does not appear to be a valid PDF." },
        { status: 400 }
      );
    }

    parser = new PDFParse({ data: bytes });

    const result = await parser.getText();

    const extractedText = result.text
      .replace(/\u0000/g, "")
      .trim()
      .slice(0, MAX_EXTRACTED_CHARACTERS);

    if (!extractedText) {
      return NextResponse.json(
        {
          error:
            "No readable text was found. This may be a scanned PDF; OCR is not enabled yet.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name.slice(0, 180),
      text: extractedText,
      truncated:
        result.text.length > MAX_EXTRACTED_CHARACTERS,
    });
  } catch (error) {
    console.error("PDF extraction error:", error);

    return NextResponse.json(
      {
        error:
          "We could not read this PDF. It may be damaged or password-protected.",
      },
      { status: 422 }
    );
  } finally {
    if (parser) {
      await parser.destroy().catch((error: unknown) => {
        console.error("PDF parser cleanup error:", error);
      });
    }
  }
  }
