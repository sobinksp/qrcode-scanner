const { Image } = require("image-js");
const jsQR = require("jsqr");
const fs = require("fs");
const {
  MultiFormatReader,
  BarcodeFormat,
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  DecodeHintType,
  NotFoundException,
} = require("@zxing/library");

const formats = [BarcodeFormat.QR_CODE];
const hints = new Map();

hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
hints.set(DecodeHintType.TRY_HARDER, true);

const reader = new MultiFormatReader();
reader.setHints(hints);

async function main() {
  const imageList = getFilesName("images");
  const maxFileNameLength = Math.max(...imageList.map((file) => file.length));
  for (const file of imageList) {
    try {
      const qrcode = await zxing(`images/${file}`);
      console.log(
        `File name: ${file.padEnd(maxFileNameLength)} | Decoded QR: ${qrcode}`
      );
    } catch (error) {
      console.log(error);
    }
  }
}

function getFilesName(dir) {
  const fileList = fs.readdirSync(dir);
  return fileList;
}
async function zxing(fileName) {
  let image = await Image.load(fileName);

  image = image.rgba8();
  const xWidth = 400;
  const yHeight = 400;
  const cropWidth = 350;
  const cropHeight = 400;
  const x = image.width - xWidth;
  const y = image.height - yHeight;

  let cropImage = image.crop({
    x: x,
    y: y,
    width: cropWidth,
    height: cropHeight,
  });

  const len = cropImage.width * cropImage.height;
  const luminancesUint8Array = new Uint8ClampedArray(len);

  for (let i = 0; i < len; i++) {
    luminancesUint8Array[i] =
      ((cropImage.data[i * 4] +
        cropImage.data[i * 4 + 1] * 2 +
        cropImage.data[i * 4 + 2]) /
        4) &
      0xff;
  }

  // Create a LuminanceSource and BinaryBitmap for decoding
  const luminanceSource = new RGBLuminanceSource(
    luminancesUint8Array,
    cropImage.width,
    cropImage.height
  );
  const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

  try {
    const decoded = reader.decode(binaryBitmap);

    const name = fileName.split("/")[0];
    if (!decoded?.text) {
      console.log(`can't decode file: ${name}`);
      await cropImage.save(`cropped_error_${name}`);
    }
    return decoded?.text;
  } catch (err) {
    throw err;
  }
}

main();
