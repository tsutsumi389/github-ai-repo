import { getLanguageColor } from "@/lib/language-colors";

type LanguageIndicatorProps = {
  language: string;
};

export function LanguageIndicator({ language }: LanguageIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block size-3 rounded-full"
        style={{ backgroundColor: getLanguageColor(language) }}
        aria-hidden="true"
      />
      {language}
    </span>
  );
}
