// // app/api/video/rename/route.ts
// import { NextResponse } from "next/server";
// import { renameBlob } from "@/utils/azure";

// export async function POST(request: Request) {
//   try {
//     const { currentPath, newName } = await request.json();
//     await renameBlob(currentPath, newName);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error renaming file/folder:", error);
//     return NextResponse.json({ error: "Failed to rename file/folder" }, { status: 500 });
//   }
// }
