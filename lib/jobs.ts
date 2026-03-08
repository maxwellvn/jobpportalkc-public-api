import type { DbRow } from "@/lib/db";
import { getDbPool } from "@/lib/db";

type Nullable<T> = T | null;

type JobRow = DbRow & {
  id: number;
  slug: string;
  title: string;
  description: Nullable<string>;
  requirements: Nullable<string>;
  responsibilities: Nullable<string>;
  department_id: Nullable<number>;
  engagement_type: Nullable<string>;
  location: Nullable<string>;
  remote_policy: Nullable<string>;
  skills_required: Nullable<string | number[]>;
  experience_min_years: Nullable<number>;
  experience_max_years: Nullable<number>;
  openings_count: Nullable<number>;
  applications_count: Nullable<number>;
  deadline: Nullable<string>;
  is_featured: 0 | 1 | boolean;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  published_at: Nullable<string>;
  department_name: Nullable<string>;
  department_code: Nullable<string>;
};

type SkillRow = DbRow & {
  id: number;
  name: string;
  category: Nullable<string>;
};

export type PublicJob = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: Nullable<string>;
  requirements: Nullable<string>;
  responsibilities: Nullable<string>;
  department: Nullable<{
    id: number | null;
    name: string | null;
    code: string | null;
  }>;
  engagement_type: string | null;
  location: string | null;
  remote_policy: string | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  openings_count: number | null;
  applications_count: number;
  deadline: string | null;
  is_featured: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  skills_required: Array<{
    id: number;
    name: string;
    category: string | null;
  }>;
  urls: {
    detail: string;
    apply: string;
  };
};

export type JobFilters = {
  q?: string;
  department?: string;
  type?: string;
  remote?: string;
  featured?: string;
  page: number;
  limit: number;
};

function makePortalUrl(path: string): string {
  const base = (process.env.PORTAL_BASE_URL ?? "").replace(/\/+$/, "");
  if (!base) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseSkillIds(value: JobRow["skills_required"]): number[] {
  if (Array.isArray(value)) {
    return value.map(Number).filter(Number.isFinite);
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(Number).filter(Number.isFinite);
    }
  } catch {
    return [];
  }

  return [];
}

async function fetchSkillsMap(): Promise<Map<number, SkillRow>> {
  const pool = getDbPool();
  const [rows] = await pool.query<SkillRow[]>(
    "SELECT id, name, category FROM skills WHERE is_active = 1"
  );

  return new Map(rows.map((row) => [Number(row.id), row]));
}

function toPublicJob(row: JobRow, skillsMap: Map<number, SkillRow>): PublicJob {
  const skillIds = parseSkillIds(row.skills_required);
  const skillsRequired = skillIds
    .map((skillId) => skillsMap.get(skillId))
    .filter((skill): skill is SkillRow => Boolean(skill))
    .map((skill) => ({
      id: Number(skill.id),
      name: skill.name,
      category: skill.category ?? null,
    }));

  const description = row.description ?? null;
  const summarySource = description ? stripHtml(description) : "";

  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    summary: truncate(summarySource, 220),
    description,
    requirements: row.requirements ?? null,
    responsibilities: row.responsibilities ?? null,
    department: row.department_id
      ? {
          id: Number(row.department_id),
          name: row.department_name ?? null,
          code: row.department_code ?? null,
        }
      : null,
    engagement_type: row.engagement_type ?? null,
    location: row.location ?? null,
    remote_policy: row.remote_policy ?? null,
    experience_min_years:
      row.experience_min_years !== null ? Number(row.experience_min_years) : null,
    experience_max_years:
      row.experience_max_years !== null ? Number(row.experience_max_years) : null,
    openings_count: row.openings_count !== null ? Number(row.openings_count) : null,
    applications_count: Number(row.applications_count ?? 0),
    deadline: row.deadline ?? null,
    is_featured: Boolean(row.is_featured),
    published_at: row.published_at ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
    skills_required: skillsRequired,
    urls: {
      detail: makePortalUrl(`/jobs/${row.slug || row.id}`),
      apply: makePortalUrl(`/jobs/${row.slug || row.id}/apply`),
    },
  };
}

function buildWhere(filters: Omit<JobFilters, "page" | "limit">) {
  const clauses = [
    "j.status = 'open'",
    "COALESCE(j.is_internal_only, 0) = 0",
  ];
  const params: Array<string | number> = [];

  if (filters.department) {
    clauses.push("j.department_id = ?");
    params.push(Number(filters.department));
  }

  if (filters.type) {
    clauses.push("j.engagement_type = ?");
    params.push(filters.type);
  }

  if (filters.remote) {
    clauses.push("j.remote_policy = ?");
    params.push(filters.remote);
  }

  if (filters.featured === "true") {
    clauses.push("COALESCE(j.is_featured, 0) = 1");
  }

  if (filters.featured === "false") {
    clauses.push("COALESCE(j.is_featured, 0) = 0");
  }

  if (filters.q) {
    const like = `%${filters.q}%`;
    clauses.push(
      "(j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ? OR d.name LIKE ?)"
    );
    params.push(like, like, like, like);
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function listPublicJobs(filters: JobFilters) {
  const pool = getDbPool();
  const skillsMap = await fetchSkillsMap();
  const page = Math.max(1, filters.page);
  const limit = Math.min(100, Math.max(1, filters.limit));
  const offset = (page - 1) * limit;
  const { whereSql, params } = buildWhere(filters);

  const [countRows] = await pool.query<DbRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM jobs j
      LEFT JOIN departments d ON d.id = j.department_id
      ${whereSql}
    `,
    params
  );

  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.query<JobRow[]>(
    `
      SELECT
        j.id,
        j.slug,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.department_id,
        j.engagement_type,
        j.location,
        j.remote_policy,
        j.skills_required,
        j.experience_min_years,
        j.experience_max_years,
        j.openings_count,
        j.applications_count,
        j.deadline,
        j.is_featured,
        j.created_at,
        j.updated_at,
        j.published_at,
        d.name AS department_name,
        d.code AS department_code
      FROM jobs j
      LEFT JOIN departments d ON d.id = j.department_id
      ${whereSql}
      ORDER BY COALESCE(j.is_featured, 0) DESC, COALESCE(j.published_at, j.created_at) DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  return {
    meta: {
      total,
      page,
      limit,
      pages: total > 0 ? Math.ceil(total / limit) : 0,
      generated_at: new Date().toISOString(),
    },
    filters: {
      q: filters.q || null,
      department: filters.department || null,
      type: filters.type || null,
      remote: filters.remote || null,
      featured:
        filters.featured === "true"
          ? true
          : filters.featured === "false"
            ? false
            : null,
    },
    data: rows.map((row) => toPublicJob(row, skillsMap)),
  };
}

export async function getPublicJob(slugOrId: string) {
  const pool = getDbPool();
  const skillsMap = await fetchSkillsMap();

  const isNumericId = /^\d+$/.test(slugOrId);
  const [rows] = await pool.query<JobRow[]>(
    `
      SELECT
        j.id,
        j.slug,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.department_id,
        j.engagement_type,
        j.location,
        j.remote_policy,
        j.skills_required,
        j.experience_min_years,
        j.experience_max_years,
        j.openings_count,
        j.applications_count,
        j.deadline,
        j.is_featured,
        j.created_at,
        j.updated_at,
        j.published_at,
        d.name AS department_name,
        d.code AS department_code
      FROM jobs j
      LEFT JOIN departments d ON d.id = j.department_id
      WHERE j.status = 'open'
        AND COALESCE(j.is_internal_only, 0) = 0
        AND (${isNumericId ? "j.id = ?" : "j.slug = ?"})
      LIMIT 1
    `,
    [isNumericId ? Number(slugOrId) : slugOrId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return toPublicJob(row, skillsMap);
}
