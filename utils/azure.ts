import {
    BlobServiceClient,
    ContainerClient,
    StorageSharedKeyCredential,
  } from "@azure/storage-blob";
  import { Readable } from "stream";
  import path from "path"
  
  const AZURE_STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
  const AZURE_STORAGE_ACCOUNT_KEY = process.env.STORAGE_ACCOUNT_KEY;
  const AZURE_STORAGE_CONTAINER_NAME = process.env.STORAGE_CONTAINER_NAME;
  
  const sharedKeyCredential = new StorageSharedKeyCredential(
    AZURE_STORAGE_ACCOUNT_NAME!,
    AZURE_STORAGE_ACCOUNT_KEY!
  );
  
  const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
  );
  
  const containerClient: ContainerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME!);
  
  // export async function uploadToAzureStream(stream: Readable, blobName: string): Promise<string> {
  //   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  //   await blockBlobClient.uploadStream(stream);
  //   return blockBlobClient.url;
  // }
  export async function uploadToAzureStream(
    stream: Readable | Blob,
    blobName: string,
    parentFolder = ""
  ): Promise<string> {
    const fullBlobName = parentFolder ? `${parentFolder}/${blobName}` : blobName;
    const blockBlobClient = containerClient.getBlockBlobClient(fullBlobName);
  
    if (stream instanceof Readable) {
      await blockBlobClient.uploadStream(stream);
    } else {
      await blockBlobClient.uploadData(stream)
    }
  
    return blockBlobClient.url;
  }
  // List blobs (files and folders) in Azure Blob Storage
  export async function listBlobs(prefix: string = ""): Promise<any[]> {
    let blobs = containerClient.listBlobsFlat({ prefix });
    const items = [];
    for await (const blob of blobs) {
      items.push(blob);
    }
    return items;
  }
  
  // Rename a blob (file or folder) in Azure Blob Storage
  export async function renameBlob(
    currentPath: string,
    newName: string
  ): Promise<void> {
    const currentBlobClient = containerClient.getBlobClient(currentPath);
    const blobProperties = await currentBlobClient.getProperties();
    const isDirectory = blobProperties.metadata?.hdi_isfolder === "true";
    const blobsToRename = await listBlobs(currentPath);
    const parentFolder = path.dirname(currentPath);
  
    for await (const blob of blobsToRename) {
      const oldBlobName = blob.name;
      const newBlobName = isDirectory
        ? oldBlobName.replace(currentPath, `${parentFolder}/${newName}`)
        : `${parentFolder}/${newName}`;
      const newBlobClient = containerClient.getBlobClient(newBlobName);
      await newBlobClient.beginCopyFromURL(blob.url);
      await currentBlobClient.delete();
    }
  }
  
  // Delete a blob (file or folder) in Azure Blob Storage
  export async function deleteBlob(blobName: string): Promise<void> {
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.delete();
  }
  
  // Create a folder in Azure Blob Storage
  export async function createFolder(folderName: string): Promise<void> {
    const blobName = folderName.endsWith("/") ? folderName : `${folderName}/`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload("", 0, {
      metadata: { hdi_isfolder: "true" },
    });
  }
  
  // Download a file from Azure Blob Storage
  export async function downloadBlob(blobName: string): Promise<Buffer> {
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    return downloaded;
  }
  
  async function streamToBuffer(readableStream: NodeJS.ReadableStream | undefined): Promise<Buffer> {
    if (!readableStream) {
      throw new Error("No readable stream provided");
    }
    const chunks = [];
    for await (const chunk of readableStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks as Uint8Array[]);
  }
  