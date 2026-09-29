import React from "react";
import { useParams } from "react-router-dom";
import GrammarTopicReviewHistory from "../../../../../components/GrammarTopicReviewHistory/GrammarTopicReviewHistory";

function AdminGrammarTopicHistory() {
  const { topicId } = useParams();
  return <GrammarTopicReviewHistory topicId={topicId} role="admin" />;
}

export default AdminGrammarTopicHistory;
