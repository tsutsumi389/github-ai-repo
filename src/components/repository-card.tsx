import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Repository } from "@/types/github";

type RepositoryCardProps = {
  repository: Repository;
};

export function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <a
      href={repository.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <Image
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
          <CardTitle className="truncate text-base">
            {repository.full_name}
          </CardTitle>
        </CardHeader>
      </Card>
    </a>
  );
}
