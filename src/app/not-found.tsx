import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="items-center text-center">
              <FileQuestion className="size-12 text-muted-foreground" />
              <CardTitle>ページが見つかりません</CardTitle>
              <CardDescription>
                お探しのページは存在しないか、移動した可能性があります。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/">ホームに戻る</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
