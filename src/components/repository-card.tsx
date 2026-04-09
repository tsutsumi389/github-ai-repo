import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Repository } from "@/types/github";

type RepositoryCardProps = {
  repository: Repository;
};

export function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <Link
      href={`/repositories/${repository.owner.login}/${repository.name}`}
      className="block"
    >
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3 px-4">
          <Image
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="truncate font-medium">{repository.full_name}</span>
        </div>
      </Card>
    </Link>
  );
}
