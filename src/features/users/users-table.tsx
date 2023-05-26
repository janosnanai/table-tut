import type {
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import type { DataOptionsState } from "../../components/table";

import { useReducer } from "react";
import { functionalUpdate } from "@tanstack/react-table";

import MyTable from "../../components/table";
import userColumns from "./user-cols";
import useGetUsersQuery from "../../hooks/use-get-users-query";

import { PAGE_LIMITS } from "../../config";

const initialPagination = {
  pageIndex: 0,
  pageSize: PAGE_LIMITS[0],
} as PaginationState;

const initialDataOptions = {
  pagination: initialPagination,
  sorting: [],
  filter: { global: "" },
} as DataOptionsState;

const enum DataOptionsActionType {
  SET_GLOBAL_FILTER = "SET_GLOBAL_FILTER",
  SET_GLOBAL_FILTER_SAFE_PAGINATION = "SET_GLOBAL_FILTER_SAFE_PAGINATION",
  SET_PAGINATION = "SET_PAGINATION",
  SET_SORTING = "SET_SORTING",
}

interface dataOptionsAction {
  type: DataOptionsActionType;
  payload: any;
}

function dataOptionsReducer(
  state: DataOptionsState,
  action: dataOptionsAction
): DataOptionsState {
  switch (action.type) {
    case DataOptionsActionType.SET_GLOBAL_FILTER: {
      return {
        ...state,
        filter: { ...state.filter, global: action.payload },
      };
    }
    case DataOptionsActionType.SET_GLOBAL_FILTER_SAFE_PAGINATION: {
      return {
        ...state,
        filter: { ...state.filter, global: action.payload },
        pagination: { ...state.pagination, pageIndex: 0 },
      };
    }
    case DataOptionsActionType.SET_PAGINATION: {
      return {
        ...state,
        pagination: { ...action.payload },
      };
    }
    case DataOptionsActionType.SET_SORTING: {
      return { ...state, sorting: action.payload };
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
}

function UsersTable() {
  const [dataOptions, dispatchDataOptionsAction] = useReducer(
    dataOptionsReducer,
    initialDataOptions
  );

  function setGlobalFilter(update: string) {
    dispatchDataOptionsAction({
      type: DataOptionsActionType.SET_GLOBAL_FILTER_SAFE_PAGINATION,
      payload: update,
    });
  }

  function setPagination(updaterFn: Updater<PaginationState>) {
    const prev = { ...dataOptions.pagination };
    const update = functionalUpdate(updaterFn, prev);
    dispatchDataOptionsAction({
      type: DataOptionsActionType.SET_PAGINATION,
      payload: update,
    });
  }

  function setSorting(updaterFn: Updater<SortingState>) {
    const prev = [...dataOptions.sorting];
    const update = functionalUpdate(updaterFn, prev);
    dispatchDataOptionsAction({
      type: DataOptionsActionType.SET_SORTING,
      payload: update,
    });
  }

  const { data: usersData } = useGetUsersQuery(dataOptions);

  return (
    <MyTable
      columns={userColumns}
      data={usersData?.data}
      globalFilter={dataOptions.filter.global}
      pagination={dataOptions.pagination}
      sorting={dataOptions.sorting}
      count={usersData?.pagination.count}
      setGlobalFilter={setGlobalFilter}
      setPagination={setPagination}
      setSorting={setSorting}
    />
  );
}

export default UsersTable;
