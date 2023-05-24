import type { UsersPage } from "../mocks/handlers";
import type { ColumnSort } from "@tanstack/react-table";

import { useQuery } from "@tanstack/react-query";

import { API_ENTRYPOINT } from "../config";

interface Options {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: ColumnSort[];
  filter: {
    global: string;
  };
}

async function queryFn(options: Options) {
  const url = `${API_ENTRYPOINT}/users${
    options
      ? "?" +
        (options.pagination
          ? "limit=" +
            options.pagination.pageSize.toString() +
            "&page=" +
            options.pagination.pageIndex.toString()
          : "") +
        (options.sorting.length > 0
          ? "&orderby=" +
            options.sorting[0].id +
            "&desc=" +
            options.sorting[0].desc.toString()
          : "") +
        (options.filter ? "&st=" + options.filter.global : "")
      : ""
  }`;

  const data = await fetch(url);

  return data.json();
}

export default (options: Options) =>
  useQuery<UsersPage>({
    queryKey: ["users", options],
    queryFn: () => queryFn(options),
  });
