"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAiModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { InterView } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { useRouter } from "next/navigation";

function InterviewPrompt() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPos, setJobPos] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExp, setJobExp] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();
  const { user } = useUser();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const InputPrompt = `Job Position: ${jobPos}; Job Description: ${jobDesc}; Years of Experience: ${jobExp}. Using this job information, give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions and answers, all in JSON format.`;
    const result = await chatSession.sendMessage(InputPrompt);
    const MockJsonResponse = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    setJsonResponse(MockJsonResponse);
    if (MockJsonResponse) {
      const response = await db
        .insert(InterView)
        .values({
          mockId: uuidv4(),
          jsonMockResp: MockJsonResponse,
          jobPos: jobPos,
          jobDesc: jobDesc,
          jobExp: jobExp,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("MM-DD-YYYY"),
        })
        .returning({ mockId: InterView.mockId });
      if (response) {
        setOpenDialog(false);
        router.push(`/dashboard/interview/${response[0]?.mockId}`);
      }
    } else {
      console.log("ERROR");
    }
    setLoading(false);
  };
  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your interview...
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>
                    Add details about your job position/role, job description,
                    and years of experience
                  </h2>
                  <div className="mt-7 mb-3">
                    <label>Job Position/Role</label>
                    <Input
                      placeholder="Ex. Marine Biologist"
                      required
                      onChange={(event) => setJobPos(event.target.value)}
                    ></Input>
                  </div>
                  <div className="my-3">
                    <label>Job Description</label>
                    <Textarea
                      placeholder="Enter sentences, a comma-separated list of keywords, or both!"
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    ></Textarea>
                  </div>
                  <div className="my-3">
                    <label>Years of Experience</label>
                    <Input
                      placeholder="Ex. 5"
                      type="number"
                      max="100"
                      required
                      onChange={(event) => setJobExp(event.target.value)}
                    ></Input>
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        "Generating from AI"
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InterviewPrompt;
