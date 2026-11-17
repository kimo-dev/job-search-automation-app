import path from "path";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';
import { CvSections, Section, sectionHeadingPatterns } from "@/types/file";


export class CVParser {

    static async parseCvData(file: File, buffer: Buffer<ArrayBuffer>) {
        const fileName = file.name.toLowerCase();
        const extension = path.extname(fileName).slice(1).toLocaleLowerCase();
        let rawText = '';
        switch (extension) {
            case "pdf":
                const pdfData = new PDFParse({ data: buffer });
                try {
                    rawText = (await pdfData.getText()).text;

                } finally {
                    pdfData.destroy();
                }
                break;
            case "docx":
                const result = await mammoth.extractRawText({ buffer });
                rawText = result.value;
                break;
            case "doc":
                const extractor = new WordExtractor();
                const extracted = await extractor.extract(buffer);
                rawText = extracted.getBody();
                break;
            default:
                throw new Error("Unsupported file type");
        }
        if (!rawText.trim()) {
            throw new Error("Could not extract text from CV");
        }

        return rawText;
    }

static removeBulletPrefix(line: string): string {
  return line.replace(/^\s*[•*▪◦‣-]\s*/, "").trim();
}

static findSectionHeading(
  line: string,
): { section: Section | null; inlineContent: string } | null {
  const cleanedLine = CVParser.removeBulletPrefix(line);

  for (const { section, pattern } of sectionHeadingPatterns) {
    const match = cleanedLine.match(pattern);

    if (match) {
      return {
        section,
        inlineContent: match[1]?.trim() ?? "",
      };
    }
  }

  return null;
}

static isPdfPageFooter(line: string): boolean {
  return /^--\s*\d+\s+of\s+\d+\s*--$/i.test(line);
}

static parseCvSections(rawText: string): CvSections {
    const sections: CvSections = {
    skills: [],
    experiences: [],
    educations: [],
    certifications: [],
  };

  let currentSection: Section | null = null;

  for (const rawLine of rawText.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();
    if (!line || CVParser.isPdfPageFooter(line)) continue;

    const heading = CVParser.findSectionHeading(line);

    if (heading) {
      currentSection = heading.section;

      // For example, "Certifications: CCNA Cisco Certificate".
      if (currentSection && heading.inlineContent) {
        sections[currentSection].push(heading.inlineContent);
      }

      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  return sections;
}

}
