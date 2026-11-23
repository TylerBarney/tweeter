// AI-assisted: see AI-ATTRIBUTION.md
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ImageDao } from "../ImageDao";
import { requireEnv } from "./documentClient";
import { lazy } from "./lazy";

const getS3Client = lazy(() => new S3Client({}));

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

export class S3ImageDao implements ImageDao {
  private readonly bucket: string;
  private readonly prefix: string;
  private readonly region: string;

  public constructor(private readonly client = getS3Client()) {
    this.bucket = requireEnv("PROFILE_IMAGE_BUCKET");
    this.prefix = requireEnv("PROFILE_IMAGE_PREFIX");
    this.region = requireEnv("AWS_REGION");
  }

  public async putImage(
    fileName: string,
    imageStringBase64Encoded: string,
  ): Promise<string> {
    const key = `${this.prefix}${fileName}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.from(imageStringBase64Encoded, "base64"),
        ACL: "public-read",
        ContentType: this.contentType(fileName),
      }),
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private contentType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
    return CONTENT_TYPES[extension] ?? "application/octet-stream";
  }
}
