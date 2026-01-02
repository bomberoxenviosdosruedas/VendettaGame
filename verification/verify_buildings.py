from playwright.sync_api import sync_playwright, expect

def verify_buildings_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:9002/test-buildings", timeout=60000)

            # Assertions to ensure content loaded
            expect(page.get_by_text("TEST: Habitaciones")).to_be_visible()
            # Queue Header
            expect(page.get_by_text("Cola de Construcción (2/5)")).to_be_visible()

            # Check for specific queue item using more specific locator (cell in table)
            expect(page.get_by_role("cell", name="Oficina del Jefe").first).to_be_visible()

            # Check for Building Card (Heading)
            expect(page.get_by_role("heading", name="Oficina del Jefe").first).to_be_visible()

            # Take screenshot
            page.screenshot(path="verification/buildings_ui.png", full_page=True)
            print("Screenshot taken at verification/buildings_ui.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_state.png", full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_buildings_ui()
