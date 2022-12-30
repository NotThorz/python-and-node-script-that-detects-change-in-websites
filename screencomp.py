from PIL import Image, ImageChops
import os
from selenium import webdriver
import time
import datetime

# write the path to your screenshot folder and results folder  :
path_to_screenshot = "C:/Users/pc/Desktop/screenshots"
path_to_results = "C:/Users/pc/Desktop/results.txt"


def take_screenshot(url, width, height):
    global counter
    # Get the list of existing screenshots
    existing_screenshots = [f for f in os.listdir(
        path_to_screenshot) if f.endswith(".png")]
    # Calculate the next available number for the screenshot
    next_number = len(existing_screenshots)
    counter = next_number
    # Set the file name for the screenshot
    file_name = "{}.png".format(next_number)
    file_path = os.path.join(path_to_screenshot, file_name)
    # Create a webdriver instance
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--window-size={},{}".format(width, height))
    driver = webdriver.Chrome(options=options)
    # Navigate to the url
    driver.get(url)
    # Wait for the page to load
    time.sleep(5)
    # Save the screenshot
    driver.save_screenshot(file_path)
    # Close the webdriver instance
    driver.close()


def compare_images(image1, image2):
    # Check if the first image exists
    if not os.path.exists(image1):
        # Write "nothing to compare to" to the results file
        with open(os.path.expanduser(path_to_results), "a") as f:
            f.write("nothing to compare to\n")
        return
    # Check if the second image exists
    if not os.path.exists(image2):
        # Write "nothing to compare to" to the results file
        with open(os.path.expanduser(path_to_results), "a") as f:
            f.write("Nothing to compare to\n")
        return
    # Open the two images
    img1 = Image.open(image1)
    img2 = Image.open(image2)
    # Calculate the difference between the two images
    diff = ImageChops.difference(img1, img2)
    # Calculate the total number of pixels in the image
    total_pixels = img1.size[0] * img1.size[1]
    # Calculate the number of different pixels
    different_pixels = sum(sum(x) for x in diff.getdata())
    # Calculate the difference as a percentage
    difference = (different_pixels / total_pixels) * 100
    # Get the current date and time
    now = datetime.datetime.now()
    # Format the date and time as a string
    date_time = now.strftime("%Y-%m-%d %H:%M:%S")
    # Open the results file for writing
    with open(os.path.expanduser(path_to_results), "a") as f:
        # Write the date and time and the difference to the file
        f.write("{}: {}%\n".format(date_time, difference))
    # Return the difference as a percentage
    return difference


while True:
    # write the link and the view port , 1920*1080 is default for pc , you can google viewport of different devices
    take_screenshot("https://www.facebook.com", 1920, 1080)
    p = str(counter-1)
    s = str(counter)
    compare_images(path_to_screenshot+'/'+p+'.png',
                   path_to_screenshot+'/'+s+'.png')

    time.sleep(86400)
