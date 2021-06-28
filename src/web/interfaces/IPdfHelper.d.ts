export interface PdfHelper {
  pdfToSvgBlob: (File) => Promise<{ blob?: Blob, errorMessage?: string }>;
}
