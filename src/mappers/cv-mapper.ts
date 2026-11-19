import { knownSkills, ReturnedParsedData, type CvSections } from "@/types/file";
import { IMapper } from "./IMapper";
import { UserCV } from "@/generated/prisma/client";

type SkillRecord = {
  skill_name: string;
  profiency: string | null;
  years_exp: number | null;
};

type ExperienceRecord = {
  job_title: string | null;
  company_name: string | null;
  start_date: Date | null;
  end_date: Date | null;
  is_current: boolean;
  description: string | null;
};

type EducationRecord = {
  degree: string | null;
  field_of_study: string | null;
  institution: string | null;
  description: string | null;
  grad_date: Date | null;
};

type CertificationRecord = {
  cert_name: string;
  issuer: string | null;
  issued_date: Date | null;
};

export type ParsedCvData = {
  skills: SkillRecord[];
  experiences: ExperienceRecord[];
  educations: EducationRecord[];
  certifications: CertificationRecord[];
};
type ParsedDateRange = {
  start_date: Date | null;
  end_date: Date | null;
  is_current: boolean;
};

export interface UserCVResponseSource  {
  savedCV: UserCV,
  parsedData: ParsedCvData
}

export class MapCvSectionsMapper implements IMapper<CvSections, ParsedCvData> {
  map(data: CvSections): ParsedCvData {

    const experiences = parseExperiences(data.experiences);

    return {
      skills: parseSkills(data.skills),
      experiences: experiences,
      educations: parseEducations(data.educations),
      certifications: parseCertifications(data.certifications),
    };
  }
}

export class MapUserCVResponse implements IMapper<UserCVResponseSource, ReturnedParsedData> {
  map(data: UserCVResponseSource): ReturnedParsedData {
    return {
            ...data.parsedData,
            id: data.savedCV.id,
            file_url: data.savedCV.fileUrl,
            createdAt: data.savedCV.createdAt
        };
  }

}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeBulletPrefix(line: string): string {
  return line.replace(/^\s*[•*▪◦‣-]\s*/, "").trim();
}

function parseSkills(lines: string[]): SkillRecord[] {
  const results = new Map<string, SkillRecord>();

  for (const rawLine of lines) {
    const line = removeBulletPrefix(rawLine);

    for (const skill of knownSkills) {
      const escapedSkill = escapeRegExp(skill);
      const skillPattern = new RegExp(
        `(^|[^A-Za-z0-9])(${escapedSkill})(?=$|[^A-Za-z0-9])`,
        "i",
      );
      const match = skillPattern.exec(line);

      if (!match) continue;

      const afterSkill = line.slice(match.index + match[0].length);

      const proficiencyMatch = afterSkill.match(
        /^\s*(?:[:,-]\s*)?(Beginner|Intermediate|Advanced|Expert)\b/i,
      );

      const yearsMatch = afterSkill.match(
        /^\s*(?:[,;(]\s*)?(?:(?:Beginner|Intermediate|Advanced|Expert)\b\s*[,;)]*\s*)?(\d+(?:\.\d+)?)\s*\+?\s*years?\b/i,
      );

      const key = skill.toLowerCase();

      if (!results.has(key)) {
        results.set(key, {
          skill_name: skill,
          profiency: proficiencyMatch?.[1] ?? null,
          years_exp: yearsMatch ? Number(yearsMatch[1]) : null,
        });
      }
    }
  }

  return [...results.values()];
}

function parseExperiences(lines: string[]): ExperienceRecord[] {
  const experiences: ExperienceRecord[] = [];
  let current: ExperienceRecord | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const header = parseExperienceHeader(line);

    if (header) {
      if (current) experiences.push(current);
      current = header;
      continue;
    }

    const dateRange = parseDateRange(line);

    if (dateRange && current && !current.start_date) {
      current.start_date = dateRange.start_date;
      current.end_date = dateRange.end_date;
      current.is_current = dateRange.is_current;
      continue;
    }

    if (!current) continue;

    const descriptionLine = removeBulletPrefix(line);
    if (!descriptionLine) continue;

    current.description = [current.description, descriptionLine]
      .filter(Boolean)
      .join("\n");
  }

  if (current) experiences.push(current);

  return experiences;
}

function parseExperienceHeader(line: string): ExperienceRecord | null {
  const parts = line.split("|").map((part) => part.trim());

  if (parts.length >= 2 && parts[0] && parts[1]) {
    const trailingParts = parts.slice(2);
    const dateRange = trailingParts.length
      ? parseDateRange(trailingParts[trailingParts.length - 1])
      : null;

    const extraHeaderText = trailingParts
      .filter((part) => part && !isDateRangeText(part))
      .join(" | ");

    return {
      company_name: parts[0],
      job_title: parts[1],
      start_date: dateRange?.start_date ?? null,
      end_date: dateRange?.end_date ?? null,
      is_current: dateRange?.is_current ?? false,
      description: extraHeaderText
        ? `Additional header text: ${extraHeaderText}`
        : null,
    };
  }

  const atMatch = line.match(/^(.{2,80}?)\s+(?:at|@)\s+(.{2,100})$/i);

  if (atMatch && !/[.!?]$/.test(line)) {
    return {
      job_title: atMatch[1].trim(),
      company_name: atMatch[2].trim(),
      start_date: null,
      end_date: null,
      is_current: false,
      description: null,
    };
  }

  return null;
}

function isDateRangeText(value: string): boolean {
  return parseDateRange(value) !== null;
}

function parseDateRange(input: string): ParsedDateRange | null {
  const text = normalizeDateSpacing(input);

  const dateToken =
    String.raw`(?:[A-Za-z]+\s+\d{1,2},?\s+\d{4}|[A-Za-z]+\s+\d{4}|\d{4}(?:-\d{1,2})?)`;

  const match = text.match(
    new RegExp(
      `^(${dateToken})\\s*(?:-|–|—|to)\\s*(Present|Current|Now|${dateToken})$`,
      "i",
    ),
  );

  if (!match) return null;

  const startDate = parseCvDate(match[1]);
  const isCurrent = /^(present|current|now)$/i.test(match[2]);
  const endDate = isCurrent ? null : parseCvDate(match[2]);

  if (!startDate || (!isCurrent && !endDate)) return null;

  return {
    start_date: startDate,
    end_date: endDate,
    is_current: isCurrent,
  };
}

function normalizeDateSpacing(value: string): string {
  return value
    .trim()
    .replace(/([A-Za-z])(\d{4})/g, "$1 $2")
    .replace(/\s*([–—])\s*/g, " $1 ")
    .replace(/\s+-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCvDate(value: string): Date | null {
  const text = normalizeDateSpacing(value);

  const numericDate = text.match(/^(\d{4})(?:-(\d{1,2}))?$/);

  if (numericDate) {
    const year = Number(numericDate[1]);
    const month = Number(numericDate[2] ?? "1");

    if (month < 1 || month > 12) return null;

    return new Date(Date.UTC(year, month - 1, 1));
  }

  const monthDate = text.match(
    /^([A-Za-z]+)\s+(\d{1,2})?,?\s*(\d{4})$/,
  );

  if (!monthDate) return null;

  const monthIndex = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].indexOf(monthDate[1].toLowerCase());

  if (monthIndex === -1) return null;

  const day = Number(monthDate[2] ?? "1");
  const year = Number(monthDate[3]);
  const date = new Date(Date.UTC(year, monthIndex, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseEducations(lines: string[]): EducationRecord[] {
  const records: EducationRecord[] = [];

  for (const rawLine of lines) {
    const line = removeBulletPrefix(rawLine);
    if (!line) continue;

    const parts = line.split("|").map((part) => part.trim());
    if (parts.length < 2) continue;

    const qualification = parts[0];
    const institution = parts[1] || null;

    const datePartIndex = parts.findIndex((part) => isDateRangeText(part));
    const dateRange =
      datePartIndex >= 0 ? parseDateRange(parts[datePartIndex]) : null;

    const qualificationMatch = qualification.match(/^(.*?)\s+in\s+(.+)$/i);

    const degree = qualificationMatch
      ? qualificationMatch[1].trim()
      : qualification;

    const fieldOfStudy = qualificationMatch
      ? qualificationMatch[2].trim()
      : null;

    const extraParts = parts.filter(
      (_part, index) => index !== 0 && index !== 1 && index !== datePartIndex,
    );

    const descriptionParts: string[] = [];

    if (extraParts.length) {
      descriptionParts.push(`Additional details: ${extraParts.join(" | ")}`);
    }

    records.push({
      degree: degree || null,
      field_of_study: fieldOfStudy,
      institution: institution,
      description: descriptionParts.length
        ? descriptionParts.join("\n")
        : null,
      grad_date: dateRange?.end_date ?? (datePartIndex >= 0
        ? parseCvDate(parts[datePartIndex])
        : null),
    });
  }

  return records;
}

function parseCertifications(lines: string[]): CertificationRecord[] {
  const records: CertificationRecord[] = [];

  for (const rawLine of lines) {
    const line = removeBulletPrefix(rawLine);
    if (!line) continue;

  
    const parts = line
      .split(/\s*[|—–]\s*|\s+-\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (!parts.length) continue;

    const dateIndex = parts.findIndex((part) => parseCvDate(part) !== null);
    const issuedDate = dateIndex >= 0 ? parseCvDate(parts[dateIndex]) : null;

    const certName = parts[0];
    const issuer =
      parts.find(
        (_part, index) => index > 0 && index !== dateIndex,
      ) ?? null;

    records.push({
      cert_name: certName,
      issuer,
      issued_date: issuedDate,
    });
  }

  return records;
}