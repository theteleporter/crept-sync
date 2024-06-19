

import { NextResponse } from "next/server";
import { PassThrough, Readable } from "stream";
import nodemailer from "nodemailer";
import { BlobServiceClient } from "@azure/storage-blob";
import { validateAndTransformRemoteUrl } from "@/lib/utils";
import { getGoogleDriveVideo } from "@/utils/googleDrive";

const AZURE_CONTAINER_NAME = "your-container-name"; // replace with your container name
const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB

interface UploadResult {
  originalUrl: string;
}

// Utility class to convert ReadableStream to Node.js Readable stream
class CustomReadableStream extends Readable {
  private innerStream: ReadableStream<Uint8Array>;
  private reader: ReadableStreamDefaultReader<Uint8Array>;

  constructor(readableStream: ReadableStream<Uint8Array>) {
    super();
    this.innerStream = readableStream;
    this.reader = this.innerStream.getReader();
  }

  _read = async () => {
    const { done, value } = await this.reader.read();
    if (done) {
      this.push(null); // signal end of stream
    } else {
      this.push(Buffer.from(value)); // convert Uint8Array to Buffer
    }
  };
}

// Azure upload function
async function uploadToAzureBlob(stream: Readable, filename: string) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING as string);
  const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  
  const buffer = await streamToBuffer(stream);
  const blockIds: string[] = [];
  let start = 0;

  while (start < buffer.length) {
    const end = Math.min(start + CHUNK_SIZE, buffer.length);
    const chunk = buffer.slice(start, end);
    const blockId = Buffer.from(`${start}`).toString('base64');
    blockIds.push(blockId);
    await blockBlobClient.stageBlock(blockId, chunk, chunk.length);
    start = end;
  }

  await blockBlobClient.commitBlockList(blockIds);
  return blockBlobClient.url;
}

// Utility function to convert stream to buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const urls = data.getAll("urls") as string[];

    if (!urls.length) {
      return NextResponse.json({ error: "No video URLs provided" }, { status: 400 });
    }

    const uploadedVideos: UploadResult[] = [];
    const errors: string[] = [];

    // Create transporter before the loop for efficiency
    const transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
      connectionTimeout: 15000,
    });

    for (const url of urls) {
      try {
        const validatedUrl = await validateAndTransformRemoteUrl(url);

        let readableStream: Readable;
        if (validatedUrl.includes("drive.google.com")) {
          const driveFile = await getGoogleDriveVideo(validatedUrl);
          readableStream = Readable.from(driveFile);
        } else {
          const response = await fetch(validatedUrl);
          if (!response.ok || !response.body) {
            throw new Error(`Failed to fetch video from ${url}`);
          }

          readableStream = new CustomReadableStream(response.body);
        }

        const filename = validatedUrl.split("/").pop() || `video_${Date.now()}`;

        const originalAzureUrl = await uploadToAzureBlob(readableStream, filename);

        const uploadResult: UploadResult = { originalUrl: originalAzureUrl };
        uploadedVideos.push(uploadResult);
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        errors.push(`Error processing ${url}: ${(error as Error).message}`);
      }
    }

    // Send email with uploaded URLs
    let emailText = "Videos Uploaded:\n\n";
    uploadedVideos.forEach((result) => {
      emailText += `Successfully uploaded video: ${result.originalUrl}\n`;
    });

    if (errors.length > 0) {
      emailText += "\nErrors:\n";
      emailText += errors.join("\n");
    }

    await transporter.sendMail({
      from: "Crept Studio Azure <support@mail.crept.studio>",
      to: process.env.ADMIN_EMAIL,
      subject: "Videos Uploaded",
      text: emailText,
    });

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: uploadedVideos });
  } catch (error: any) {
    console.error("Error uploading and processing video:", error);
    return NextResponse.json({ success: false, error: error.message || "Unknown error occurred" }, { status: 500 });
  }
}
