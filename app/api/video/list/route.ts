
// app/api/video/list/route.ts
import { NextResponse } from "next/server";
import { listBlobs } from "@/utils/azure";

interface FileItem {
  name: string;
  isFolder: boolean;
  fullPath: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const folderPath = url.searchParams.get("folderPath") || ""; // Get folder path from query parameters

  try {
    const blobs = await listBlobs(folderPath);
    const files: FileItem[] = blobs.map((blob) => ({
      name: blob.name.split("/").pop() || blob.name,
      isFolder: blob.properties.contentLength === 0,
      fullPath: blob.name
    }));
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}


