const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const puppeteer = require('puppeteer');
const Jimp = require('jimp');

//change these after you create the files on ur desktop
const pathToScreenshot = "C:/Users/pc/Desktop/screenshots";
const pathToResults = "C:/Users/pc/Desktop/results.txt";

// Example usage , change the url to the one of ur needs and the width height to the view
//port u want 
const url = 'https://www.facebook.com';
const width = 1920;
const height = 1080;



async function takeScreenshot(url, width, height, pathToScreenshot) {
  // Get the list of existing screenshots and calculate the next available number
  const files = fs.readdirSync(pathToScreenshot);
  const existingScreenshots = files.filter((f) => f.endsWith('.png'));
  const nextNumber = existingScreenshots.length + 1;

  // Set the file name and create the full file path
  const fileName = `${nextNumber}.png`;
  const filePath = path.join(pathToScreenshot, fileName);

  // Create a new browser instance and set the viewport size
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height });

  // Navigate to the URL and wait for the page to load
  await page.goto(url);
  await page.waitForSelector('body', { timeout: 10000 });

  // Take a screenshot and save it to the file path
  const screenshot = await page.screenshot({ fullPage: true });
  fs.writeFileSync(filePath, screenshot);

  // Close the browser instance
  await browser.close();
}

//compare the images ,the recent and previous one and write the change to the results file
async function compareImages(image1Path, image2Path, pathToResults) {
  // Read the images
  const image1 = await Jimp.read(image1Path);
  const image2 = await Jimp.read(image2Path);

  // Check that the images are the same size
  if (image1.bitmap.width !== image2.bitmap.width || image1.bitmap.height !== image2.bitmap.height) {
    throw new Error('Images must be the same size');
  }

  // Compare the images pixel by pixel
  let differentPixels = 0;
  for (let x = 0; x < image1.bitmap.width; x++) {
    for (let y = 0; y < image1.bitmap.height; y++) {
      // Check if the pixel at (x, y) is different in the two images
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));
      const pixel2 = Jimp.intToRGBA(image2.getPixelColor(x, y));
      if (pixel1.r !== pixel2.r || pixel1.g !== pixel2.g || pixel1.b !== pixel2.b || pixel1.a !== pixel2.a) {
        differentPixels++;
      }
    }
  }

  // Calculate the difference in percentage
  const totalPixels = image1.bitmap.width * image1.bitmap.height;
  const difference = differentPixels / totalPixels;

  // Write the difference to the output file
  const dateTime = new Date().toISOString();
  await promisify(fs.appendFile)(pathToResults, `${dateTime}: ${difference}%\n`);
  return difference;
}

const main = async () => {
  while (true) {
    try {
      await takeScreenshot(url, width, height, pathToScreenshot);
      const files = fs.readdirSync(pathToScreenshot);
      const existing = files.filter((f) => f.endsWith('.png'));
      const counter = existing.length;
      console.log('Script is running ...\n')
      if (counter > 1) {
        const p = `${counter - 1}`;
        const s = `${counter}`;
        await compareImages(path.join(pathToScreenshot, `${p}.png`), path.join(pathToScreenshot, `${s}.png`),pathToResults);
        //change the next line if u want to change the time intervals , 84600seconds is 24 hours .
        await promisify(setTimeout)(84600);
      } else {
        await promisify(fs.appendFile)(pathToResults, 'Only one picture exists , can\'t compare\n');
      }
    } catch (error) {
      console.error(error);
    }
  }
};



main();