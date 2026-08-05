import type { Request } from "express";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export function getPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(req.query.limit) || DEFAULT_PAGE_SIZE),
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
