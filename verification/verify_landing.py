from playwright.sync_api import sync_playwright, expect
import re

def verify_landing_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:9002/", timeout=60000)

            # 1. Header
            expect(page.get_by_role("heading", name="VENDETTA")).to_be_visible()

            # 2. Navbar Stats
            expect(page.get_by_text(re.compile(r"Online:\s*\d+"))).to_be_visible()

            # 3. Login Box (CardTitle is a div)
            expect(page.get_by_text("Login", exact=True).first).to_be_visible()

            # 4. Top Players
            expect(page.get_by_text("Mejores Jugadores", exact=True)).to_be_visible()

            # Screenshot
            page.screenshot(path="verification/landing_page.png", full_page=True)
            print("Screenshot taken at verification/landing_page.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_landing.png", full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_landing_page()
