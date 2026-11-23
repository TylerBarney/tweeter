// AI-assisted: see AI-ATTRIBUTION.md
import { ImageDao } from "../ImageDao";
import { FakeDao } from "./FakeDao";

export class FakeImageDao extends FakeDao implements ImageDao {
  public async putImage(
    fileName: string,
    _imageStringBase64Encoded: string,
  ): Promise<string> {
    return `https://example.com/image/${fileName}`;
  }
}
