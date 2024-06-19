// // app/api/video/create-folder/route.ts
// import { NextResponse } from "next/server";
// import { createFolder } from "@/utils/azure";

// export async function POST(request: Request) {
//   try {
//     const { folderName, parentFolder } = await request.json();
//     // await createFolder(folderName, parentFolder); // Assuming your createFolder function takes a parentFolder argument
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error creating folder:", error);
//     return NextResponse.json(
//       { error: "Failed to create folder" },
//       { status: 500 }
//     );
//   }
// }
