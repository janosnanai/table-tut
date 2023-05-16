import type { UsersPage } from "../mocks/handlers";

import { useQuery } from "@tanstack/react-query";

import { API_ENTRYPOINT } from "../config";

interface Options {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: {
    id: string;
    desc: boolean;
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
        (options.sorting
          ? "&orderby=" +
            options.sorting.id +
            "&desc=" +
            options.sorting.desc.toString()
          : "")
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
