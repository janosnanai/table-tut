import type { User } from "./db";

import { rest } from "msw";
import db from "./db";

import { API_ENTRYPOINT, PAGE_LIMITS, SORT_DIRECTION } from "../config";

export const handlers = [
  rest.get(`${API_ENTRYPOINT}/users`, (req, res, ctx) => {
    const limit = req.url.searchParams.get("limit");
    const page = req.url.searchParams.get("page");
    const orderBy = req.url.searchParams.get("orderby");
    const desc = req.url.searchParams.get("desc") === "true";
    const searchTerm = req.url.searchParams.get("st");

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

    let formattedOrderBy;

    if (orderBy) {
      const orderByArr = orderBy.split(".");

      formattedOrderBy = {};

      orderByArr.reduce((acc, cur, idx) => {
        return ((acc[cur as keyof typeof acc] as object | string) =
          idx === orderByArr.length - 1
            ? desc
              ? SORT_DIRECTION.DESC
              : SORT_DIRECTION.ASC
            : {});
      }, formattedOrderBy);
    }

    const paginatedUsers = db.user.findMany({
      take: formattedLimit,
      skip: formattedPage * formattedLimit,
      // @ts-ignore TODO
      orderBy: formattedOrderBy,
      where: {
        fullName: {
          contains: searchTerm || "",
        },
      },
    });

    const count = db.user.count();

    return res(
      ctx.status(200),
      ctx.json({
        pagination: {
          count,
          index: formattedPage,
          limit: formattedLimit,
        },
        sorting: { id: orderBy, desc },
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
  pagination: {
    count: number;
    index: number;
    limit: number;
  };
  sorting: { id: string; desc: boolean };
  data: User[];
};
