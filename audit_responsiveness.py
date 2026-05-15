from playwright.sync_api import sync_playwright
import os

def capture_screenshots(url, base_name):
    resolutions = [
        {"width": 1024, "height": 768, "label": "1024x768"},
        {"width": 1440, "height": 900, "label": "1440x900"},
        {"width": 1920, "height": 1080, "label": "1920x1080"},
    ]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for res in resolutions:
            page = browser.new_page(viewport={"width": res["width"], "height": res["height"]})
            print(f"Capturing {base_name} at {res['label']}...")
            page.goto(url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000) # Wait for animations
            path = f"audit_{base_name}_{res['label']}.png"
            page.screenshot(path=path, full_page=True)
            print(f"Saved to {path}")
            page.close()
        browser.close()

if __name__ == "__main__":
    # Home page
    capture_screenshots("http://localhost:3000", "home")
    # A chapter page (if slug exists)
    # capture_screenshots("http://localhost:3000/chapter/chapter-1", "chapter1")
    # A tool page
    # capture_screenshots("http://localhost:3000/tools/big-five-test", "big-five")
