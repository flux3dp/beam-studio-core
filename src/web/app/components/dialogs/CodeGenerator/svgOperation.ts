export function removeFirstRectTag(svgString: string): string {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  // Parse the SVG string to a document
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  // Find the first <rect> element
  const firstRect = doc.querySelector('rect');

  if (firstRect) {
    // Remove the first <rect> element
    firstRect.parentNode.removeChild(firstRect);
  }

  // Serialize the document back to a string
  return serializer.serializeToString(doc);
}

export function extractSvgTags(svgString: string, tag: string): Array<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const elements = doc.querySelectorAll(tag);

  // Convert NodeList to an array and map to extract outer HTML of each element
  return Array.from(elements).map((element) => element.outerHTML);
}
