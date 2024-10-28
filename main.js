const { Image } = require("image-js");
const jsQR = require("jsqr");
const fetch = require("node-fetch");

const main = async () => {
  // open a file called "lenna.png"
  const imageUrl =
    "https://s3easyrice.cloudhm.io/inference-raw-image-dev/0001/24102024181127.png";
  // 0001/24102024180312.png
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  let image = await Image.load(Buffer.from(buffer)); // Load the image from buffer
  // let image = await Image.load("SCID-B1.0-N018_SC3190.png");
  // let image = await Image.load("scanned_image_01.png");
  image = image.rgba8();

  // const sharpImage = await sharp("scanned_image_01.png").metadata();

  const cropWidth = 400;
  const cropHeight = 330;
  // const cropWidth = 700;
  // const cropHeight = 730;
  const x = image.width - cropWidth;
  const y = image.height - cropHeight;

  const cropImage = image.crop({
    x: x,
    y: y,
    widht: cropWidth,
    height: cropHeight,
  });
  const decodedQR = jsQR(cropImage.data, cropImage.width, cropImage.height);
  console.log("decoded: ", decodedQR?.data);
  await cropImage.save("crop_image.png");
};

main();
