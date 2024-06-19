
// utils/googleDrive.ts
import { google } from "googleapis";
import { Readable } from "stream";


export async function getGoogleDriveVideo(url: string): Promise<Readable> {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID,
        process.env.GOOGLE_DRIVE_CLIENT_SECRET,
        process.env.GOOGLE_DRIVE_REDIRECT_URI,
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });

   
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const fileId = extractFileIdFromUrl(url);
    if (!fileId) {
      throw new Error("Invalid Google Drive link");
    }
  
    try {
      const res = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );
  
      // Handle potential errors in the Google Drive API response
      if (res.status !== 200 || !res.data) {
        throw new Error(
          `Google Drive API error: Status ${res.status}, ${
            (res.data as any)?.error?.message || "Unknown error"
          }`
        );
      }
      
      // Ensure response is a stream
      if (typeof res.data.pipe !== "function") {
        throw new Error("Invalid response from Google Drive: not a stream");
      }
  
      return Readable.from(res.data);
    } catch (error) {
      throw new Error(
        `Error fetching video from Google Drive: ${(error as Error).message}`
      ); // Handle both fetching and API errors
    }
  }
  
  // Helper function to extract file ID from Google Drive URL
  function extractFileIdFromUrl(url: string): string | null {
    const match = url.match(/\/file\/d\/([^\/]+)/);
    return match ? match[1] : null;
  }

  