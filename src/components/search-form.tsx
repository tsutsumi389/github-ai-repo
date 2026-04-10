"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm() {
  const searchParams = useSearchParams();
  const defaultValue = searchParams.get("q") ?? "";

  return (
    <form action="/" method="get" className="flex gap-2">
      <Input
        type="search"
        name="q"
        placeholder="リポジトリを検索..."
        defaultValue={defaultValue}
        className="max-w-md"
      />
      <Button type="submit">検索</Button>
    </form>
  );
}
