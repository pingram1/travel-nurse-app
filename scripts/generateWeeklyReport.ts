/**
 * Weekly client progress report generator for KR2 Group.
 * Fetches git commits from the past 7 days, categorizes them by feature area,
 * and emails a client-friendly summary via Resend.
 *
 * Run locally:  npm run report:weekly
 * Run in CI:    triggered by .github/workflows/weekly-client-report.yml
 */

import { config as loadEnv } from 'dotenv';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { Resend } from 'resend';

loadEnv();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GitCommit {
  hash: string;
  date: string;
  author: string;
  subject: string;
  body: string;
}

type FeatureCategory =
  | 'Logistics Engine'
  | 'Safety & Compliance APIs'
  | 'Stipend Tracker'
  | 'Credential Vault'
  | 'General Infrastructure';

interface CategorizedCommit extends GitCommit {
  category: FeatureCategory;
  clientSummary: string;
}

interface ReportConfig {
  clientName: string;
  projectName: string;
  developerName: string;
  reportClientEmail: string;
  reportCcEmails: string[];
  emailApiKey: string;
  emailFrom: string;
  dryRun: boolean;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const FEATURE_CATEGORIES: Record<FeatureCategory, RegExp[]> = {
  'Logistics Engine': [
    /\blogistic/i,
    /\bbooking\b/i,
    /\bflight/i,
    /\btransit/i,
    /\bhousing/i,
    /\blodging/i,
    /\bwork.?order/i,
    /\btrip.?plan/i,
    /\btravel.?plan/i,
    /\bnavigat/i,
  ],
  'Safety & Compliance APIs': [
    /\bsafety/i,
    /\bcompliance/i,
    /\bosha/i,
    /\bcrime/i,
    /\bnibrs/i,
    /\bfacility.?rating/i,
    /\bbls\b/i,
    /\brisk.?score/i,
    /\bshield/i,
  ],
  'Stipend Tracker': [
    /\bstipend/i,
    /\btake.?home/i,
    /\bpay.?calc/i,
    /\bper.?diem/i,
    /\bcontract.?pay/i,
    /\bhousing.?rate/i,
    /\bvariance/i,
  ],
  'Credential Vault': [
    /\bvault/i,
    /\bcredential/i,
    /\blicen[sc]e/i,
    /\bacls/i,
    /\bcertif/i,
    /\bsecure.?store/i,
    /\bdocument.?upload/i,
  ],
  'General Infrastructure': [
    /\bauth/i,
    /\blogin/i,
    /\bapi\b/i,
    /\barchitect/i,
    /\binfra/i,
    /\bci\b/i,
    /\btest/i,
    /\bui\b/i,
    /\bcomponent/i,
    /\bhook/i,
    /\bstore/i,
    /\bnavigat/i,
    /\bexpo/i,
    /\bdeploy/i,
    /\bsecurity/i,
    /\berror.?handl/i,
  ],
};

const JARGON_PATTERNS: RegExp[] = [
  /^merge(d)?\b/i,
  /^merge pull request/i,
  /^fix typo/i,
  /^typo fix/i,
  /^lint(ing)?\b/i,
  /^format(ting)?\b/i,
  /^prettier\b/i,
  /^wip\b/i,
  /^chore:/i,
  /^bump\b/i,
  /^update deps/i,
  /^dependency update/i,
  /^renovate/i,
  /^dependabot/i,
  /^revert\b/i,
  /^fix lint/i,
  /^fix format/i,
  /^minor fix/i,
  /^cleanup\b/i,
  /^code review/i,
  /^address review/i,
  /^pr comment/i,
  /^resolve conflict/i,
  /^fix ci\b/i,
  /^ci fix/i,
];

const CATEGORY_ORDER: FeatureCategory[] = [
  'Logistics Engine',
  'Safety & Compliance APIs',
  'Stipend Tracker',
  'Credential Vault',
  'General Infrastructure',
];

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

function fetchCommitsSince(days: number): GitCommit[] {
  const since = `${days} days ago`;
  const format = '%H|%ad|%an|%s|%b<<<END>>>';
  let raw: string;

  try {
    raw = execSync(`git log --since="${since}" --pretty=format:"${format}" --date=short`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch {
    return [];
  }

  if (!raw) return [];

  return raw
    .split('<<<END>>>')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash = '', date = '', author = '', subject = '', ...bodyParts] = entry.split('|');
      return {
        hash: hash.slice(0, 7),
        date,
        author,
        subject: subject.trim(),
        body: bodyParts.join('|').trim(),
      };
    });
}

// ---------------------------------------------------------------------------
// Parsing & filtering
// ---------------------------------------------------------------------------

function isDeveloperJargon(message: string): boolean {
  const normalized = message.trim();
  return JARGON_PATTERNS.some((pattern) => pattern.test(normalized));
}

function categorizeCommit(commit: GitCommit): FeatureCategory {
  const searchText = `${commit.subject} ${commit.body}`.toLowerCase();

  for (const category of CATEGORY_ORDER) {
    const patterns = FEATURE_CATEGORIES[category];
    if (patterns.some((pattern) => pattern.test(searchText))) {
      return category;
    }
  }

  return 'General Infrastructure';
}

function toClientSummary(commit: GitCommit): string {
  let summary = commit.subject
    .replace(/^(feat|feature|fix|chore|refactor|docs|test|style|perf|build|ci)(\(.+?\))?:\s*/i, '')
    .replace(/\[.+?\]\s*/g, '')
    .trim();

  summary = summary.charAt(0).toUpperCase() + summary.slice(1);

  if (!summary.endsWith('.')) {
    summary += '.';
  }

  return summary;
}

function processCommits(commits: GitCommit[]): CategorizedCommit[] {
  const seen = new Set<string>();

  return commits
    .filter((commit) => {
      if (!commit.subject || isDeveloperJargon(commit.subject)) return false;
      const key = commit.subject.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((commit) => ({
      ...commit,
      category: categorizeCommit(commit),
      clientSummary: toClientSummary(commit),
    }));
}

// ---------------------------------------------------------------------------
// Report formatting
// ---------------------------------------------------------------------------

function formatDateRange(): { start: string; end: string; generated: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York',
    });

  return {
    start: fmt(start),
    end: fmt(end),
    generated: fmt(end),
  };
}

function buildMarkdownReport(
  config: ReportConfig,
  commits: CategorizedCommit[],
): string {
  const { start, end, generated } = formatDateRange();
  const grouped = new Map<FeatureCategory, CategorizedCommit[]>();

  for (const category of CATEGORY_ORDER) {
    grouped.set(category, []);
  }

  for (const commit of commits) {
    grouped.get(commit.category)?.push(commit);
  }

  const activeCategories = CATEGORY_ORDER.filter(
    (cat) => (grouped.get(cat)?.length ?? 0) > 0,
  );

  const lines: string[] = [
    `# Weekly Progress Report`,
    ``,
    `**Client:** ${config.clientName}`,
    `**Project:** ${config.projectName}`,
    `**Reporting Period:** ${start} — ${end}`,
    `**Prepared by:** ${config.developerName}`,
    `**Generated:** ${generated}`,
    ``,
    `---`,
    ``,
    `## Executive Summary`,
    ``,
  ];

  if (commits.length === 0) {
    lines.push(
      `No feature-driven development commits were recorded during this reporting period. The team remains focused on upcoming deliverables for the Travel Nurse Logistics & Safety App.`,
      ``,
    );
  } else {
    lines.push(
      `This week, the development team delivered **${commits.length} update${commits.length === 1 ? '' : 's'}** across **${activeCategories.length} feature area${activeCategories.length === 1 ? '' : 's'}**. Below is a breakdown of progress by module.`,
      ``,
    );

    for (const category of activeCategories) {
      const items = grouped.get(category) ?? [];
      lines.push(`## ${category}`, ``);

      for (const item of items) {
        lines.push(`- ${item.clientSummary}`);
      }

      lines.push(``);
    }

    lines.push(`## Development Activity`, ``);
    lines.push(`| Date | Update |`, `| --- | --- |`);

    for (const commit of commits) {
      lines.push(`| ${commit.date} | ${commit.clientSummary} |`);
    }

    lines.push(``);
  }

  lines.push(
    `---`,
    ``,
    `*This report was automatically generated from verified source-control activity. For questions or a live demo, please contact ${config.developerName}.*`,
    ``,
    `*Start Right Tutoring, LLC — Confidential*`,
  );

  return lines.join('\n');
}

function markdownToHtml(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split('\n')
    .map((line) => {
      if (line.startsWith('# ')) {
        return `<h1 style="color:#1e293b;font-size:24px;margin-bottom:8px;">${line.slice(2)}</h1>`;
      }
      if (line.startsWith('## ')) {
        return `<h2 style="color:#2563eb;font-size:18px;margin-top:24px;margin-bottom:8px;">${line.slice(3)}</h2>`;
      }
      if (line.startsWith('- ')) {
        return `<li style="margin-bottom:4px;color:#334155;">${line.slice(2)}</li>`;
      }
      if (line.startsWith('| ')) {
        const cells = line
          .split('|')
          .filter(Boolean)
          .map((c) => c.trim());
        if (cells.every((c) => /^-+$/.test(c))) return '';
        const tag = line.includes('Date') ? 'th' : 'td';
        const style =
          tag === 'th'
            ? 'style="padding:8px 12px;background:#f1f5f9;font-weight:600;text-align:left;border:1px solid #e2e8f0;"'
            : 'style="padding:8px 12px;border:1px solid #e2e8f0;color:#334155;"';
        return `<tr>${cells.map((c) => `<${tag} ${style}>${c}</${tag}>`).join('')}</tr>`;
      }
      if (line === '---') {
        return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;
      }
      if (line === '') return '<br />';
      if (line.startsWith('**') && line.endsWith('**')) {
        const inner = line.slice(2, -2);
        const [label, ...rest] = inner.split(':');
        if (rest.length > 0) {
          return `<p style="margin:4px 0;color:#334155;"><strong>${label}:</strong>${rest.join(':')}</p>`;
        }
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return `<p style="font-size:12px;color:#94a3b8;font-style:italic;margin-top:16px;">${line.slice(1, -1)}</p>`;
      }
      return `<p style="margin:4px 0;color:#334155;">${line}</p>`;
    })
    .join('\n')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul style="padding-left:20px;">${match}</ul>`)
    .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table style="width:100%;border-collapse:collapse;margin:12px 0;">${match}</table>`);
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

function loadConfig(): ReportConfig {
  const reportClientEmail = process.env.REPORT_CLIENT_EMAIL;
  const emailApiKey = process.env.EMAIL_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!reportClientEmail) {
    throw new Error('Missing required environment variable: REPORT_CLIENT_EMAIL');
  }
  if (!emailApiKey) {
    throw new Error('Missing required environment variable: EMAIL_API_KEY');
  }
  if (!emailFrom) {
    throw new Error('Missing required environment variable: EMAIL_FROM');
  }

  const ccRaw = process.env.REPORT_CC_EMAILS ?? '';
  const reportCcEmails = ccRaw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return {
    clientName: process.env.REPORT_CLIENT_NAME ?? 'KR2 Group',
    projectName:
      process.env.REPORT_PROJECT_NAME ?? 'Travel Nurse Logistics & Safety App',
    developerName: process.env.REPORT_DEVELOPER_NAME ?? 'Start Right Tutoring, LLC',
    reportClientEmail,
    reportCcEmails,
    emailApiKey,
    emailFrom,
    dryRun: process.env.REPORT_DRY_RUN === 'true',
  };
}

async function sendReportEmail(
  config: ReportConfig,
  markdown: string,
  commitCount: number,
): Promise<void> {
  const resend = new Resend(config.emailApiKey);
  const { start, end } = formatDateRange();
  const subject = `${config.projectName} — Weekly Progress Report (${start} – ${end})`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:680px;margin:0 auto;padding:32px 24px;background:#ffffff;">
  ${markdownToHtml(markdown)}
</body>
</html>`;

  if (config.dryRun) {
    console.log('[DRY RUN] Email would be sent to:', config.reportClientEmail);
    if (config.reportCcEmails.length > 0) {
      console.log('[DRY RUN] CC:', config.reportCcEmails.join(', '));
    }
    console.log('[DRY RUN] Subject:', subject);
    console.log('[DRY RUN] Commits included:', commitCount);
    return;
  }

  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [config.reportClientEmail],
    cc: config.reportCcEmails.length > 0 ? config.reportCcEmails : undefined,
    subject,
    html,
    text: markdown,
  });

  if (error) {
    throw new Error(`Failed to send report email: ${error.message}`);
  }

  console.log(`Report emailed successfully (id: ${data?.id ?? 'unknown'})`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function saveReportLocally(markdown: string): string {
  const reportsDir = join(process.cwd(), 'reports');
  mkdirSync(reportsDir, { recursive: true });

  const filename = `weekly-${new Date().toISOString().slice(0, 10)}.md`;
  const filepath = join(reportsDir, filename);
  writeFileSync(filepath, markdown, 'utf-8');

  return filepath;
}

async function main(): Promise<void> {
  console.log('Generating weekly client progress report...\n');

  const config = loadConfig();
  const rawCommits = fetchCommitsSince(7);
  const commits = processCommits(rawCommits);
  const markdown = buildMarkdownReport(config, commits);

  const savedPath = saveReportLocally(markdown);
  console.log(`Report saved locally: ${savedPath}`);
  console.log(`Commits processed: ${rawCommits.length} raw → ${commits.length} client-facing\n`);

  await sendReportEmail(config, markdown, commits.length);

  console.log('\nWeekly report generation complete.');
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Report generation failed:', message);
  process.exit(1);
});
