import React from "react";
import { useOutletContext } from "react-router-dom";
import GrammarTopicReviewHistory from "../../../../../components/GrammarTopicReviewHistory/GrammarTopicReviewHistory";

function TeacherGrammarHistory() {
  const { topicId } = useOutletContext();
  return <GrammarTopicReviewHistory topicId={Number(topicId)} role="teacher" />;
}

export default TeacherGrammarHistory;
