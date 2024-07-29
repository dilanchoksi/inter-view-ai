"use client";

import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Feedback({ params }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getFeedback();
  }, []);

  const getFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId))
      .orderBy(UserAnswer.id);
    console.log(result);
    setFeedbackList(result);
    console.log(feedbackList);
  };

  return (
    <div className="p-10">
      {feedbackList?.length > 0 ? (
        <>
          <h2 className="text-3xl font-bold text-green-500">
            Congratulations!
          </h2>
          <h2 className="font-bold text-2xl">
            Here is your interview feedback
          </h2>
          <h2 className="text-primary text-lg my-3">
            Your overall interview rating:{" "}
            <strong>(FEATURE COMING SOON)</strong>
          </h2>
          <h2 className="text-sm text-zinc-500">
            We'll show you your answer for each question, along with an
            AI-generated confident answer, feedback for you, and your overall
            rating on each question.
          </h2>
          {feedbackList &&
            feedbackList.map((item, index) => (
              <Collapsible key={index} className="mt-7">
                <CollapsibleTrigger className="flex justify-between gap-7 p-2 bg-secondary rounded-lg my-2 text-left w-full">
                  {item.question} <ChevronsUpDown className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-red-500 p-2 border rounded-lg">
                      <strong>Rating: </strong>
                      {item.rating}
                    </h2>
                    <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-red-900">
                      <strong>Your answer: </strong>
                      {item.userAns}
                    </h2>
                    <h2 className="p-2 border rounded-lg bg-blue-50 text-sm text-primary">
                      <strong>Feedback: </strong>
                      {item.feedback}
                    </h2>
                    <h2 className="p-2 border rounded-lg bg-green-50 text-sm text-green-900">
                      <strong>Confident answer: </strong>
                      {item.aiAns}
                    </h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      ) : (
        <h2 className="font-bold text-xl text-zinc-500">
          No Interview Feedback Found
        </h2>
      )}
      <Button onClick={() => router.replace("/dashboard")}>Go Home</Button>
    </div>
  );
}

export default Feedback;
