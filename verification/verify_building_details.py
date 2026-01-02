from playwright.sync_api import sync_playwright, expect

def verify_building_details():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:9002/test-building-details", timeout=60000)

            # Header
            expect(page.get_by_role("heading", name="Armería")).to_be_visible()
            expect(page.get_by_text("Nivel Actual: 10")).to_be_visible()

            # Table
            expect(page.get_by_role("heading", name="Proyección de Producción")).to_be_visible()
            expect(page.get_by_role("cell", name="11")).to_be_visible()
            expect(page.get_by_role("cell", name="110")).to_be_visible()
            expect(page.get_by_role("cell", name="+10")).to_be_visible() # Diff check

            # Screenshot
            page.screenshot(path="verification/building_details.png", full_page=True)
            print("Screenshot taken at verification/building_details.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_details.png", full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_building_details()
