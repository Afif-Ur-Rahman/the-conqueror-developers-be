import fs from "fs";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { AWS } from "@/constants/env";
import { LOGUI } from "@/constants/logs";

export const s3 = async (): Promise<S3Client> => {
  const { REGION, ACCESSKEYID, SECRETACCESSKEY } = AWS;

  return new S3Client({
    region: REGION,
    credentials: { accessKeyId: ACCESSKEYID, secretAccessKey: SECRETACCESSKEY },
  });
};

export const uploadFileToAws = async (
  fileName: string,
  filePath: string,
  ContentType: string,
): Promise<string> => {
  try {
    const S3Client = await s3();
    await S3Client.send(
      new PutObjectCommand({
        Bucket: AWS.BUCKET_NAME,
        Key: fileName,
        Body: fs.createReadStream(filePath),
        ContentType,
      }),
    ).then(() => {
      // Delete the file from the local filesystem after successful upload
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(LOGUI.FgRed, "Error deleting file:", err);
          }
        });
      }
    });

    const encodedFileName = encodeURIComponent(fileName).replace(/%2F/g, "/");
    const publicUrl = `https://${AWS.BUCKET_NAME}.s3.${AWS.REGION}.amazonaws.com/${encodedFileName}`;

    return publicUrl;
  } catch (err) {
    console.error("Error ", err);
    return err as string;
  }
};

export const getFileUrlFromAws = async (
  fileName: string,
  expireTime: number | null = null,
): Promise<string> => {
  try {
    const check = await isFileAvailableInAwsBucket(fileName);

    if (check) {
      const command = new GetObjectCommand({
        Bucket: AWS.BUCKET_NAME,
        Key: fileName,
      });

      const url = await getSignedUrl(await s3(), command, {
        expiresIn: expireTime ?? undefined,
      });
      return url;
    } else {
      return "error";
    }
  } catch (err) {
    console.log("error ::", err);
    return "error";
  }
};

export const isFileAvailableInAwsBucket = async (fileName: string): Promise<boolean> => {
  try {
    const S3Client = await s3();
    await S3Client.send(
      new HeadObjectCommand({
        Bucket: AWS.BUCKET_NAME,
        Key: fileName,
      }),
    );
    return true;
  } catch (err: any) {
    if (err.name === "NotFound") {
      return false;
    } else {
      console.error("Error checking file availability: ", err);
      return false;
    }
  }
};

export const deleteFileFromAws = async (fileName: string): Promise<string> => {
  try {
    const S3Client = await s3();
    const deleteParams = {
      Bucket: AWS.BUCKET_NAME,
      Key: fileName,
    };

    await S3Client.send(new DeleteObjectCommand(deleteParams));
    return "success";
  } catch (err) {
    console.error("Error ", err);
    return "error";
  }
};
