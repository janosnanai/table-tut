import type { User } from "./db";

import { rest } from "msw";
import db from "./db";

import { API_ENTRYPOINT, PAGE_LIMITS } from "../config";

export const handlers = [
  rest.get(`${API_ENTRYPOINT}/users`, (req, res, ctx) => {
    const limit = req.url.searchParams.get("limit");
    const page = req.url.searchParams.get("page");

    let formattedLimit: number;

    if (!limit) {
      formattedLimit = PAGE_LIMITS[0];
    } else if (typeof limit === "string") {
      formattedLimit = parseInt(limit);
    } else {
      formattedLimit = parseInt(limit[0]);
    }

    let formattedPage: number;

    if (!page) {
      formattedPage = 0;
    } else if (typeof page === "string") {
      formattedPage = parseInt(page);
    } else {
      formattedPage = parseInt(page[0]);
    }

    const paginatedUsers = db.user.findMany({
      take: formattedLimit,
      skip: formattedPage * formattedLimit,
    });

    const count = db.user.count();

    return res(
      ctx.status(200),
      ctx.json({
        count,
        page: formattedPage,
        limit: formattedLimit,
        data: paginatedUsers,
      })
    );
  }),

  rest.get(`${API_ENTRYPOINT}/orgs`, (_req, res, ctx) => {
    const orgs = db.org.getAll();
    return res(ctx.status(200), ctx.json(orgs));
  }),

  rest.get(`${API_ENTRYPOINT}/groups`, (_req, res, ctx) => {
    const groups = db.group.getAll();
    return res(ctx.status(200), ctx.json(groups));
  }),
];

export type UsersPage = {
  count: number;
  page: number;
  limit: number;
  data: User[];
};
