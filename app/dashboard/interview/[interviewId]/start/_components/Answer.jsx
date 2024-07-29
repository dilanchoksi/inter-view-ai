"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAiModal";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import moment from "moment";

function Answer({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    results.map((result) => {
      setUserAnswer((prevAns) => prevAns + result?.transcript);
    });
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 1) {
      SaveUserAnswer();
    }
  }, [userAnswer]);

  const ToggleRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const SaveUserAnswer = async () => {
    setLoading(true);
    const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}; User Answer: ${userAnswer}. Depending on this interview question and interviewee answer, give me descriptive feedback for the interviewee inclue areas of improvement (if any), and also give me a rating for the answer. The goal is to help the user improve their answer. Keep all feedback to 4-6 lines. You should return your result in JSON format with two fields: rating and feedback.`;
    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(mockJsonResp);
    const jsonFeedbackResp = JSON.parse(mockJsonResp);

    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      aiAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: jsonFeedbackResp?.feedback,
      rating: jsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress.emailAddress,
      createdAt: moment().format("MM-DD-YYYY"),
    });

    if (resp) {
      toast("Answer recorded successfully.");
    }

    setUserAnswer("");
    setResults([]);

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src="/webcam.webp"
          width={200}
          height={200}
          className="absolute"
        />
        <Webcam
          mirrored={true}
          style={{ height: 300, width: "100%", zIndex: 10 }}
        />
      </div>
      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={ToggleRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 flex gap-2">
            <Mic /> Stop Recording...
          </h2>
        ) : (
          "Record Answer"
        )}
      </Button>
    </div>
  );
}

export default Answer;
