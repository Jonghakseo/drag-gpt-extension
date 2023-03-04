export default function getSafePixel(pixelNumber: number) {
  return `${Math.max(pixelNumber, 0)}px`;
}
