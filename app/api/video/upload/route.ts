import { NextResponse } from "next/server";
import { PassThrough, Readable } from "stream";
import nodemailer from "nodemailer";
import { uploadToAzureStream } from "@/utils/azure";
import { validateAndTransformRemoteUrl } from "@/lib/utils";
import { getGoogleDriveVideo } from "@/utils/googleDrive";

interface UploadResult {
  originalUrl: string;
}

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
      if (!value) {
        this.emit('error', new Error('Stream read returned undefined value'));
        return;
      }
      this.push(Buffer.from(value)); // convert Uint8Array to Buffer
    }
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const urls = data.getAll("urls") as string[];

    if (!urls.length) {
      return NextResponse.json(
        { error: "No video URLs provided" },
        { status: 400 }
      );
    }

    const uploadedVideos: UploadResult[] = [];
    const errors: string[] = [];

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

        if (!validatedUrl) {
          throw new Error('URL validation failed');
        }

        let readableStream: Readable;
        if (validatedUrl.includes("drive.google.com")) {
          const driveFile = await getGoogleDriveVideo(validatedUrl);
          readableStream = Readable.from(driveFile);
        } else {
          const response = await fetch(validatedUrl);
          if (!response.ok || !response.body) {
            throw new Error(`Failed to fetch video from ${validatedUrl}`);
          }

          readableStream = new CustomReadableStream(response.body);
        }

        const filename = validatedUrl.split("/").pop() || `video_${Date.now()}`;

        const passThroughStream = new PassThrough();
        readableStream.pipe(passThroughStream);

        const uploadStream = passThroughStream.pipe(new PassThrough());
        const originalAzureUrl = await uploadToAzureStream(uploadStream, filename);

        const uploadResult: UploadResult = {
          originalUrl: originalAzureUrl,
        };

        uploadedVideos.push(uploadResult);
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        errors.push(`Error processing ${url}: ${(error as Error).message}`);
      }
    }

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
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}