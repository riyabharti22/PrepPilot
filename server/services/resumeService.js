import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * Extracts plain text from an uploaded resume file (PDF) or returns
 * pasted text as-is. Throws a friendly error on failure.
 */
export async function extractTextFromFile(fileBuffer, mimetype) {
  if (mimetype === "application/pdf") {
    try {
      const data = await pdfParse(fileBuffer);
      const text = (data.text || "").trim();
      if (!text) {
        throw new Error("empty");
      }
      return text.slice(0, 8000); // cap length
    } catch (err) {
      const e = new Error(
        "We couldn't read that PDF. Try pasting your resume text instead."
      );
      e.status = 422;
      throw e;
    }
  }

  // Fallback: treat as plain text
  return fileBuffer.toString("utf-8").slice(0, 8000);
}
