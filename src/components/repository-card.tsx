import { GitFork, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LanguageIndicator } from "@/components/language-indicator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Repository } from "@/types/github";

const MAX_TOPICS = 6;

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
        <div className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <Image
              src={repository.owner.avatar_url}
              alt={`${repository.owner.login} avatar`}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-primary truncate font-semibold">
              {repository.full_name}
            </span>
          </div>

          {repository.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {repository.description}
            </p>
          )}

          {repository.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {repository.topics.slice(0, MAX_TOPICS).map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            {repository.language && (
              <LanguageIndicator language={repository.language} />
            )}
            <span className="flex items-center gap-1">
              <Star className="size-3" aria-hidden="true" />
              <span className="sr-only">Stars:</span>
              {repository.stargazers_count.toLocaleString("en-US")}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="size-3" aria-hidden="true" />
              <span className="sr-only">Forks:</span>
              {repository.forks_count.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
