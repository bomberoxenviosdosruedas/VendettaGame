from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to test page
        url = "http://localhost:9002/test-dashboard"
        print(f"Navigating to {url}")

        try:
            page.goto(url, timeout=30000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            browser.close()
            return

        # Wait for content
        try:
            page.wait_for_selector("text=Imperio Test", timeout=10000)
            print("Dashboard loaded")
        except Exception as e:
            print(f"Error waiting for content: {e}")
            page.screenshot(path="verification_error.png")
            browser.close()
            return

        # Check for Alert Widget (Attack)
        if page.get_by_text("Ataque Entrante").is_visible():
            print("Attack alert visible")
        else:
            print("Attack alert NOT visible")

        # Take screenshot
        os.makedirs("verification", exist_ok=True)
        screenshot_path = "verification/overview_snapshot.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
