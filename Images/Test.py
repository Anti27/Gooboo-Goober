import pynput, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from pynput.keyboard import Key, Controller
from pynput import mouse, keyboard

if ( __name__ == "__main__" ):
    keyboard2 = Controller()
    options = ChromeOptions()
    options.browser_version = "latest"
    options.platform_name = "win10"
    ff_options = {}
    ff_options["timezone"] = "UTC-00:00"
    options.set_capability("goog:chromeOptions", ff_options)
    driver = webdriver.Chrome(options=options) # You can replace this with other web drivers
    driver.get("https://tendsty.github.io/gooboo/")
    global sugma
    sugma = True
    global pause
    pause = True
    balls = 0
    def on_press(key):
        if key == Key.media_play_pause:
            global pause
            pause^=True
        if key == Key.esc:
            driver.quit() # don't forget to quit the driver!
            global sugma
            sugma = False
    oldText = ""
    keyListener = keyboard.Listener(on_press=on_press)
    keyListener.start()
    while sugma:
        if pause: continue
        try:
            data = driver.find_element(By.XPATH, '//*[@id="app"]/div[1]/main/div/div/div[2]/div[1]/div[1]').find_elements(By.TAG_NAME, "span")
            text = ''.join([x.text if not x.text == '' else ' ' for x in data])
        except: continue
        if not text == oldText: 
            print(text)
            keyboard2.type(text)
            keyboard2.press(Key.ctrl)
            keyboard2.tap("a")
            keyboard2.release(Key.ctrl)
            keyboard2.tap(Key.backspace)
            oldText = text
            time.sleep(0.3)
