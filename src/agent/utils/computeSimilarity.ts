import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export function computeSimilarity(expectedPath: string, actualPath: string) {
  const expected = PNG.sync.read(fs.readFileSync(expectedPath));
  const actual = PNG.sync.read(fs.readFileSync(actualPath));

  const diffPixels = pixelmatch(
    expected.data,
    actual.data,
    null,
    expected.width,
    expected.height,
    { threshold: 0.1 }
  );

  const totalPixels = expected.width * expected.height;
  const similarity = ((totalPixels - diffPixels) / totalPixels) * 100;

  return similarity;
}
