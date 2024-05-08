/*  Beam Format
   =================================================================================
  |   Block Name   |    Length    |           Contents                              |
   =================================================================================
  |   Signature    |    5 Bytes   | [66, 101, 97, 109, 2] : Beam + version          |
   =================================================================================
  |  Header Length |     VINT     | the size of vint will grow according to value   |
   =================================================================================

   =================================================================================
  |     Header     |  header len  |                                                 |
   =================================================================================
   ---------------------------------------------------------------------------------
  |   Metadata Len |     VINT     | indicate size of metadata                       |
   ---------------------------------------------------------------------------------
  |    Metadata    | ↖            |string                                           |
   ---------------------------------------------------------------------------------
  | svg content Len |    VINT     | indicate size of svg content block              |
   ---------------------------------------------------------------------------------
  | image source Len |     VINT   | indicate size of image source block             |
   ---------------------------------------------------------------------------------
  | Thumbnail Len |     VINT   | indicate size of Thumbnail block             |
    ---------------------------------------------------------------------------------

    Blocks:

   =================================================================================
  |   Svg Content  |  content len |         Block Containing Svg contents           |
   =================================================================================
   ---------------------------------------------------------------------------------
  |   block type   |    1 Bytes   | 0x01 for svg content                            |
   ---------------------------------------------------------------------------------
  |  string length |     VINT     | indicate size of svg string                     |
   ---------------------------------------------------------------------------------
  |   svg string   | ↖            | string                                          |
   ---------------------------------------------------------------------------------

   =================================================================================
  |  Image Source  |      ...     |         Block Containing Image Source           |
   =================================================================================
   ---------------------------------------------------------------------------------
  |   block type   |    1 Bytes   | 0x02 for svg content                            |
   ---------------------------------------------------------------------------------
  |     length     |     VINT     | indicate size of remaining block                |
   ---------------------------------------------------------------------------------
  |  Image Id Len  |    1 Byte    | Len of image id                                 |
   ---------------------------------------------------------------------------------
  |       Id       | ↖            | Image Id                                        |
   ---------------------------------------------------------------------------------
  |    Image Len   |     VINT     | Len of image                                    |
   ---------------------------------------------------------------------------------
  |      Image     | ↖            | Image Source, which can be read as Blob         |
   ---------------------------------------------------------------------------------
  |                 Repeat Image Id Len, Image Id, Image Len, Image                 |
   ---------------------------------------------------------------------------------

   =================================================================================
  |   Thumbnail    |  content len |         Block Containing Thumbnail           |
   =================================================================================
   ---------------------------------------------------------------------------------
  |   block type   |    1 Bytes   | 0x03 for Thumbnail                              |
   ---------------------------------------------------------------------------------
  |  string length |     VINT     | indicate size of svg string                     |
   ---------------------------------------------------------------------------------
  |   Image        | ↖            | Image binary ofr thumbnail (jpeg)               |
   ---------------------------------------------------------------------------------

*/
import { Buffer } from 'buffer';

import Progress from 'app/actions/progress-caller';
import updateImagesResolution from 'helpers/image/updateImagesResolution';
import { importBvgString } from 'app/svgedit/operations/import/importBvg';

// Create VInt Buffer, first bit indicate continue or not, other 7 bits represent value
const valueToVIntBuffer = (value) => {
  const a: number[] = [];
  let remainingValue = value;
  while (remainingValue > 127) {
    const b = (remainingValue % 128) + 128;
    a.push(b);
    remainingValue = Math.floor(remainingValue / 128);
  }
  a.push(remainingValue);
  return Buffer.from(a);
};

const readVInt = (buffer, offset = 0) => {
  let v = 0;
  let currentByte = 0;
  let currentOffset = offset;
  while (true) {
    const b = buffer.readUInt8(currentOffset);
    currentOffset += 1;
    v += (b % 128) * 2 ** (7 * currentByte);
    currentByte += 1;
    if (b < 128) break;
  }
  return {
    value: v,
    offset: currentOffset,
  };
};

const localHeaderTypeBuffer = (type: 'svgContent' | 'imageSource' | 'thumbnail'): Buffer => {
  switch (type) {
    case 'svgContent':
      return Buffer.from([0x01]);
    case 'imageSource':
      return Buffer.from([0x02]);
    case 'thumbnail':
      return Buffer.from([0x03]);
    default:
      break;
  }
  return Buffer.from([]);
};

// 1 Byte Type (0x01 for svg content) + ? bytes vint length + length bytes svg string
const genertateSvgBlockBuffer = (svgString) => {
  const typeBuf = localHeaderTypeBuffer('svgContent');
  const svgStringBuf = Buffer.from(svgString);
  const lengthVintBuf = valueToVIntBuffer(svgStringBuf.length);
  return Buffer.concat([typeBuf, lengthVintBuf, svgStringBuf]);
};

// 1 Byte Type (0x02 for svg content) + ? bytes vint length + length bytes svg string
const generateImageSourceBlockBuffer = (imageSources: { [id: string]: ArrayBuffer }) => {
  let imageSourceBlockBuffer = localHeaderTypeBuffer('imageSource');
  let tempbuffer = Buffer.alloc(0);
  const ids = Object.keys(imageSources);
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    const idSizeBuf = Buffer.alloc(1);
    const idBuf = Buffer.from(id);
    idSizeBuf.writeUInt8(idBuf.length, 0);
    const imageBuf = Buffer.from(imageSources[id]);
    const imageSizeBuf = valueToVIntBuffer(imageBuf.length);
    tempbuffer = Buffer.concat([tempbuffer, idSizeBuf, idBuf, imageSizeBuf, imageBuf]);
  }
  imageSourceBlockBuffer = Buffer.concat([
    imageSourceBlockBuffer,
    valueToVIntBuffer(tempbuffer.length),
    tempbuffer,
  ]);
  return imageSourceBlockBuffer;
};

const generateThumbnailBlockBuffer = (thumbnail: ArrayBuffer): Buffer => {
  let blocBuffer = localHeaderTypeBuffer('thumbnail');
  const imageBuffer = Buffer.from(thumbnail);
  blocBuffer = Buffer.concat([blocBuffer, valueToVIntBuffer(imageBuffer.length), imageBuffer]);
  return blocBuffer;
};

const generateBeamBuffer = (
  svgString: string,
  imageSources: { [id: string]: ArrayBuffer },
  thumbnail?: ArrayBuffer
): Buffer => {
  const signatureBuffer = Buffer.from([66, 101, 97, 109, 2]); // Bvg{version in uint} max to 255
  const svgBlockBuf = genertateSvgBlockBuffer(svgString);
  const imageSourceBlockBuffer = generateImageSourceBlockBuffer(imageSources);
  const thumbnailBlockBuffer = thumbnail ? generateThumbnailBlockBuffer(thumbnail) : null;
  const metaDataBuf = Buffer.from('Hi, I am meta data O_<');
  const headerBuffer = Buffer.concat([
    valueToVIntBuffer(metaDataBuf.length),
    metaDataBuf,
    valueToVIntBuffer(svgBlockBuf.length),
    valueToVIntBuffer(imageSourceBlockBuffer.length),
    valueToVIntBuffer(thumbnailBlockBuffer?.length || 0),
  ]);
  const headerSizeBuf = valueToVIntBuffer(headerBuffer.length);
  const buffer = Buffer.concat([
    signatureBuffer,
    headerSizeBuf,
    headerBuffer,
    svgBlockBuf,
    imageSourceBlockBuffer,
    thumbnailBlockBuffer || Buffer.from([]),
    Buffer.from([0x00]),
  ]);
  return buffer;
};

const readHeader = (headerBuf: Buffer) => {
  let vInt;
  let offset = 0;
  vInt = readVInt(headerBuf, offset);
  offset = vInt.offset;
  const metadataSize = vInt.value;
  // const metaData = headerBuf.toString('utf-8', offset, offset + metadataSize);
  // console.log(metaData);
  offset += metadataSize;
  vInt = readVInt(headerBuf, offset);
  offset = vInt.offset;
  // console.log('svgBlockSize', vInt.value);
  vInt = readVInt(headerBuf, offset);
  offset = vInt.offset;
  // console.log('Image Source block Size', vInt.value);
  if (offset < headerBuf.length) {
    vInt = readVInt(headerBuf, offset);
    offset = vInt.offset;
    // console.log('Thumbnail block Size', vInt.value);
  }
};

const readImageSource = (buf, offset, end) => {
  let currentOffset = offset;
  while (currentOffset < end) {
    const idSize = buf.readUInt8(currentOffset);
    currentOffset += 1;
    const id = buf.toString('utf-8', currentOffset, currentOffset + idSize);
    currentOffset += idSize;
    const { value: imageSize, offset: newOffset } = readVInt(buf, currentOffset);
    currentOffset = newOffset;
    const blob = new Blob([buf.slice(currentOffset, currentOffset + imageSize)]);
    const src = URL.createObjectURL(blob);
    currentOffset += imageSize;
    document.querySelector(`#${id}`).setAttribute('origImage', src);
  }
};

const readBlocks = async (buf, offset) => {
  if (offset >= buf.length) {
    // eslint-disable-next-line no-console
    console.warn('offset exceed buffer length');
    return -1;
  }
  let currentOffset = offset;
  const blockType = buf.readUInt8(currentOffset);
  currentOffset += 1;
  if (blockType === 0) {
    // Ending Block
    currentOffset = -1;
  } else if (blockType === 1) {
    // Svg Content
    console.log('Svg Content Block');
    const { offset: newOffset, value } = readVInt(buf, currentOffset);
    currentOffset = newOffset;
    console.log('Size', value);
    const svgString = buf.toString('utf-8', currentOffset, currentOffset + value);
    await importBvgString(svgString);
    currentOffset += value;
  } else if (blockType === 2) {
    // image source
    console.log('Image Source Block');
    const { offset: newOffset, value } = readVInt(buf, currentOffset);
    currentOffset = newOffset
    console.log('Size', value);
    readImageSource(buf, currentOffset, currentOffset + value);
    updateImagesResolution(false);
    currentOffset += value;
  } else if (blockType === 3) {
    // thumbnail
    console.log('Thumbnail Block');
    const { offset: newOffset, value } = readVInt(buf, currentOffset);
    console.log('Size', value);
    currentOffset = newOffset + value;
  } else {
    // eslint-disable-next-line no-console
    console.error(`Unknown Block Type: ${blockType}`);
    currentOffset = -1;
  }
  return currentOffset;
};

const readBeam = async (file: File): Promise<void> => {
  const data = await new Promise<ArrayBuffer>((resolve) => {
    const fr = new FileReader();
    fr.onloadend = (evt) => {
      resolve(evt.target.result as ArrayBuffer);
    };
    fr.readAsArrayBuffer(file);
  });
  const buf = Buffer.from(data);

  let offset = 0;
  const signatureBuffer = buf.slice(offset, 5);
  // eslint-disable-next-line no-console
  console.log('Signature:', signatureBuffer.toString());
  offset += 5;
  const version = signatureBuffer.readUInt8(4);
  // eslint-disable-next-line no-console
  console.log('Beam Version: ', version);
  const vint = readVInt(buf, offset);
  const headerSize = vint.value;
  offset = vint.offset;
  const headerBuf = buf.slice(offset, offset + headerSize);
  readHeader(headerBuf);
  offset += headerSize;
  while (offset > 0) {
    // eslint-disable-next-line no-await-in-loop
    offset = await readBlocks(buf, offset);
  }

  Progress.popById('loading_image');
};

export default {
  generateBeamBuffer,
  readBeam,
};
