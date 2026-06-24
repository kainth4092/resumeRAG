import { memo } from "react";
import SectionCollapsible from "../interview/SectionCollapsible";
import { QuestionCard } from "./QuestionCard";

export const QuestionGroup = memo(function QuestionGroup({
  title,
  questions,
  onToggleBookmark,
  onEdit,
  onDelete,
}) {
  return (
    <SectionCollapsible title={title} count={questions.length}>
      <div className="space-y-3 pt-3">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            onToggleBookmark={onToggleBookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </SectionCollapsible>
  );
});
