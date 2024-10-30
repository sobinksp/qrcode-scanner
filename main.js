const { Image } = require("image-js");
const jsQR = require("jsqr");
const {
  MultiFormatReader,
  BarcodeFormat,
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  DecodeHintType,
  NotFoundException,
} = require("@zxing/library");

const main = async () => {
  // const imageUrl =
  //   "https://s3easyrice.cloudhm.io/inference-raw-image-dev/0001/24102024181127.png";
  // // 0001/24102024180312.png
  // const response = await fetch(imageUrl);
  // const buffer = await response.arrayBuffer();
  // let image = await Image.load(Buffer.from(buffer));
  let image = await Image.load(
    "CalibrationX-Rite _plateMFG081024_EXP081124_SNN003_QR_SCID-B1.N057_SC3197_20241028_0001.png"
  );
  image = image.rgba8();

  const xWidth = 400;
  const yHeight = 375;
  const cropWidth = 300;
  const cropHeight = 350;

  // const xWidth = 400;
  // const yHeight = 385;
  // const cropWidth = 280;
  // const cropHeight = 285;
  const x = image.width - xWidth;
  const y = image.height - yHeight;

  let cropImage = image.crop({
    x: x,
    y: y,
    width: cropWidth,
    height: cropHeight,
  });
  // cropImage = cropImage.grey();
  // cropImage = cropImage.rgba8();

  const decodedQR = jsQR(cropImage.data, cropImage.width, cropImage.height);
  console.log("decoded: ", decodedQR?.data);

  const buffer = Buffer.from(cropImage.data);

  await cropImage.save("crop_image_29.png");
};

const formats = [BarcodeFormat.QR_CODE];
const hints = new Map();

hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
hints.set(DecodeHintType.TRY_HARDER, true);

const reader = new MultiFormatReader();
reader.setHints(hints);

async function zxing() {
  let image = await Image.load(
    "CalibrationX-Rite _plateMFG081024_EXP081124_SNN003_QR_SCID-B1.N074_SC3193_20241028_0001.png"
  );
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

  await cropImage.save("crop_image_zxing.png");

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
    // if (!decoded || !decoded.text) return false;
    console.log(decoded?.text);
  } catch (err) {
    console.log(err);
  }
}
// main();
zxing();
