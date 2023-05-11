import { useQuery } from "@tanstack/react-query";

async function queryFn() {
  const data = await fetch("http://localhost:5173/groups");
  return data.json();
}

export default () =>
  useQuery({
    queryKey: ["groups"],
    queryFn,
  });
