import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";

export default function Prompt({
  prompt,
  setPrompt,
}: {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="my-2">Show prompt</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit the prompts</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Textarea
          className="mb-3"
          rows={10}
          onChange={(event) => setPrompt(event.target.value)}
          value={prompt}
        />
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
