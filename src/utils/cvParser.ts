import path from "path";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';
import { CvSections, headings, knownSkills } from "@/types/file";


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
                break;
        }
        if (!rawText.trim()) {
            throw new Error("Could not extract text from CV");
        }
        // const result = await generateText({
        //     model: openai("gpt-4o-mini"),
        //     output: Output.object({
        //         schema: cvSchema
        //     }),
        //     prompt: `Extract the candidate's skills, work experiences, education, and certifications from the following CV text:\n\n${rawText}`,
        // });
        return rawText;
    }

    static async extractData(rawText: string) {
        const result: CvSections = {
            skills: [],
            experiences: [],
            educations: [],
            certifications: []
        }

        let currentSection: keyof CvSections | null = null;

        for (const rawline of rawText.split(/\r?\n/)) {
            const line = rawline.trim();
            if (!line) continue;

            const matchedHeading = (
                Object.entries(headings) as [keyof CvSections, RegExp][]
            ).find(([, pattern]) => pattern.test(line));

            if (matchedHeading) {
                currentSection = matchedHeading[0];
                continue;
            }

            const isAnotherHeading = Object.values(headings).some((pattern) =>
                pattern.test(line),
            );
            if (isAnotherHeading) {
                currentSection = null;
                continue;
            }

            if (currentSection) {
                result[currentSection].push(line);
            }

        }

        const allText = rawText.toLowerCase();
        result.skills = knownSkills.filter((skill) =>
            new RegExp(
                `(^|[^a-z0-9+#.])${CVParser.escapeRegExp(skill.toLowerCase())}([^a-z0-9+#.]|$)`,
            ).test(allText),
        );

        return result;
    }

    static escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}