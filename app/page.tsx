import { ModeToggle } from "@/components/sub-components/mode-toggle";
import { VideoUploadForm } from "@/components/azure/video-upload";
import { Chip } from "@nextui-org/react";
import { CheckIcon } from "@radix-ui/react-icons";
import Link from "next/link"

export default function FileList() {
  return (
    <>
      <main className="container py-5 h-screen flex justify-between flex-col">
        <div className="flex justify-between w-full">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 text-start mb-4 items-center">
          <span className="mr-3">Crept Sync</span>
          <Chip
            size="sm"
            variant="faded"
            color="success"
            startContent={<CheckIcon />}
          >
            Beta
          </Chip>
        </h2>
        <ModeToggle />
        </div>
        <div className="mt-10 text-center">
          <div className="scroll-m-20 text-xl font-semibold tracking-tight mt-5 mb-4">
            Video uploader
          </div>
          <VideoUploadForm />
        </div>
        <div className="text-sm">
          Powered by <Link className="border-b border-spacing-4 hover:text-stone-600" href={"https://www.crept.studio"} target="_blank">Crept Studio</Link>
        </div>
      </main>
    </>
  );
}



