import path from "path";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { cvSchema } from "@/types/file";

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
        const result = await generateText({
            model: openai("gpt-4o-mini"),
            output: Output.object({
                schema: cvSchema
            }),
            prompt: `Extract the candidate's skills, work experiences, education, and certifications from the following CV text:\n\n${rawText}`,
        });
        return result;
    }
}