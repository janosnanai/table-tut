import type { UsersPage } from "../mocks/handlers";

import { useQuery } from "@tanstack/react-query";

import { API_ENTRYPOINT } from "../config";

interface Options {
  pageIndex: number;
  pageSize: number;
}

async function queryFn(options: Options) {
  const url = `${API_ENTRYPOINT}/users${
    options
      ? "?limit=" +
        options.pageSize.toString() +
        "&page=" +
        options.pageIndex.toString()
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
