// AI-assisted: see AI-ATTRIBUTION.md

export interface ImageDao {
  putImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;
}
