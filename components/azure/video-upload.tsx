// app/components/video-upload-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { listBlobs } from "@/utils/azure";

// interface VideoQuality {
//   _2160p?: boolean;
//   _1080p?: boolean;
//   _720p?: boolean;
//   _480p?: boolean;
// }

interface VideoUpload {
  url: string;
  newFilename: string;
}

export function VideoUploadForm() {
  const [remoteUrls, setRemoteUrls] = useState<VideoUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [folderPath, setFolderPath] = useState<string>(""); // State for folder path

  const handleUrlChange = (index: number, value: string) => {
    setRemoteUrls((prevUrls) =>
      prevUrls.map((upload, i) =>
        i === index ? { ...upload, url: value } : upload
      )
    );
  };

  const handleFilenameChange = (index: number, value: string) => {
    setRemoteUrls((prevUrls) =>
      prevUrls.map((upload, i) =>
        i === index ? { ...upload, newFilename: value } : upload
      )
    );
  };

  const handleAddUrl = () => {
    setRemoteUrls((prevUrls) => [...prevUrls, { url: "", newFilename: "" }]);
  };

  const handleRemoveUrl = (index: number) => {
    setRemoteUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData();
      remoteUrls.forEach((upload) => {
        formData.append("urls", upload.url);
        formData.append("newFilenames", upload.newFilename || "");
        formData.append("folderPath", folderPath);
      });
      // No need to append qualities anymore

      const response = await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Upload successful:", data);
        toast({
          title: "Success!",
          description: "Videos uploaded successfully!",
        });
      } else {
        console.error("Upload failed:", data.error);
        toast({
          title: "Error",
          description: data.error || "An error occurred during upload.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setRemoteUrls([]);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button color={"primary"} size={"sm"} variant={"shadow"}>
            Upload Videos
          </Button>
        </DialogTrigger>

        <DialogContent className="outline-none">
          <DialogHeader className="text-start">
            <DialogTitle>Video Uploader</DialogTitle>
            <DialogDescription>
              Add URLs and submit to upload to Microsoft Azure
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="h-64 py-4 px-2">
              <div className="space-y-7 text-center align-middle items-center h-1/3 w-full pb-10 transition-all ease-out  duration-1000">
                <div className="space-y-5">
                  {remoteUrls.map((upload, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center flex-col gap-3 mx-1 mt-1"
                    >
                      {/* Remote URL Input */}
                      <Input
                        type="url"
                        placeholder="Enter remote URL"
                        className="w-full outline-none"
                        value={upload.url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                      />

                      {/* New Filename Input (Initially Hidden) */}
                      {upload.newFilename !== "" && (
                        <Input
                          type="text"
                          placeholder="Enter new filename"
                          className="w-full outline-none"
                          value={upload.newFilename}
                          onChange={(e) =>
                            handleFilenameChange(index, e.target.value)
                          }
                        />
                      )}
                      {/* Folder Path Input */}
                      <Input
                        type="text"
                        placeholder="Enter folder path (e.g., /movies/action)"
                        className="w-full outline-none"
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                      />
                      {/* Quality Checkboxes */}
                      {/* <div className="flex justify-between w-full align-middle mx-4">
                        {["_2160p", "_1080p", "_720p", "_480p"].map(
                          (quality) => (
                            <Checkbox
                              key={quality}
                              isSelected={
                                upload.qualities[quality as keyof VideoQuality]
                              }
                              onChange={(e) =>
                                handleQualityChange(
                                  index,
                                  quality as keyof VideoQuality
                                )
                              }
                              size="sm"
                              color="default"
                            >
                              {quality.slice(1)}
                            </Checkbox>
                          )
                        )}
                      </div> */}
                      <div className="flex justify-between w-full align-middle mx-4">
                        {/* Rename Button */}
                        <Button
                          type="button"
                          onClick={() =>
                            handleFilenameChange(
                              index,
                              upload.newFilename === "" ? "Rename" : ""
                            )
                          }
                          variant={"bordered"}
                          size={"sm"}
                          className="ml-2"
                        >
                          {upload.newFilename === ""
                            ? "Rename"
                            : "Cancel Rename"}
                        </Button>

                        {/* Remove Button */}
                        <Button
                          type="button"
                          onClick={() => handleRemoveUrl(index)}
                          className="ml-2 bg-red-600 text-white"
                          variant={"solid"}
                          size={"sm"}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="flex justify-between flex-row">
              <Button
                color={"primary"}
                size={"sm"}
                type="button"
                onClick={handleAddUrl}
                variant={"shadow"}
              >
                Add URLs
              </Button>
              <Button
                color={"warning"}
                size={"sm"}
                type="submit"
                disabled={isUploading}
                variant={"shadow"}
              >
                {isUploading ? "Uploading..." : "Upload Videos"}
              </Button>
              <DialogClose asChild>
                <Button
                  className=""
                  size={"sm"}
                  variant={"shadow"}
                  color={"default"}
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>{" "}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
