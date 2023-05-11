import type { UsersPage } from "../mocks/handlers";

import { useQuery } from "@tanstack/react-query";

import { API_ENTRYPOINT } from "../config";

interface Params {
  limit: number;
  page: number;
}

async function queryFn(params: Params) {
  const url = `${API_ENTRYPOINT}/users${
    params
      ? "?limit=" + params.limit.toString() + "&page=" + params.page.toString()
      : ""
  }`;

  console.log("🚀 ~ file: useGetUsersQuery.ts:18 ~ queryFn ~ url:", url);

  const data = await fetch(url);

  return data.json();
}

export default (params: Params) =>
  useQuery<UsersPage>({
    queryKey: ["users", params],
    queryFn: () => queryFn(params),
  });
