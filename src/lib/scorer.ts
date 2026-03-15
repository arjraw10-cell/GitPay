export interface ScoreResult {
  score: number;
  reasoning: string;
  category: "bug_fix" | "feature" | "review" | "documentation" | "trivial";
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

function parseResult(text: string): ScoreResult | undefined {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return undefined;

  const result = JSON.parse(match[0]) as ScoreResult;
  if (typeof result.score !== "number" || !result.reasoning || !result.category) {
    return undefined;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(result.score))),
    reasoning: result.reasoning,
    category: result.category,
  };
}

export async function scorePR(pr: {
  title: string;
  body: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  files: Array<{ filename: string; additions: number; deletions: number; patch: string }>;
  diff: string;
}): Promise<ScoreResult> {
  const prompt = `You are a senior open source maintainer. Score this pull request contribution.

PR Title: ${pr.title}
PR Description: ${pr.body?.slice(0, 600) || "(none)"}
Stats: +${pr.additions} -${pr.deletions} lines across ${pr.changedFiles} files

Files changed:
${pr.files.slice(0, 10).map((f) => `- ${f.filename} (+${f.additions}/-${f.deletions})`).join("\n")}

Diff preview:
${pr.diff.slice(0, 3000)}

Scoring guide:
- trivial (0-15): typo, whitespace, minor formatting
- documentation (10-30): docs, comments, README
- review/minor (15-40): small fixes, config changes
- bug_fix (25-70): real bug fixes
- feature (35-100): new functionality, significant refactors

Respond with ONLY this JSON (no markdown, no code fences):
{"score": <0-100>, "reasoning": "<1 clear sentence about what this does and why it's valuable>", "category": "<bug_fix|feature|review|documentation|trivial>"}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { score: 20, reasoning: "Contribution reviewed - Gemini API key not configured.", category: "trivial" };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) throw new Error(`Gemini request failed with ${res.status}`);

      const data = await res.json() as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
      const result = parseResult(text);
      if (result) return result;
    } catch {
      if (attempt === 2) break;
    }
  }

  return { score: 20, reasoning: "Contribution reviewed - scoring unavailable.", category: "trivial" };
}
