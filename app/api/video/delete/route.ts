// // app/api/video/delete/route.ts
// import { NextResponse } from "next/server";
// import { deleteBlob } from "@/utils/azure";

// export async function DELETE(request: Request) {
//   try {
//     const { path } = await request.json();
//     await deleteBlob(path);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting file/folder:", error);
//     return NextResponse.json({ error: "Failed to delete file/folder" }, { status: 500 });
//   }
// }
