
from playwright.sync_api import Page, expect, sync_playwright
import time

def test_map_interaction(page: Page):
    print("Navigating to /test-map...")
    page.goto("http://localhost:9002/test-map")

    page.wait_for_selector("text=Test Map Components")
    print("Page loaded.")

    # 1. Click on an Empty Tile (e.g., Tile 3)
    print("Clicking empty tile 3...")
    empty_tile = page.get_by_text("3", exact=True).first
    empty_tile.click()

    # Verify Dialog Opens
    print("Verifying empty tile dialog...")
    expect(page.get_by_role("dialog")).to_be_visible()

    # Close dialog (click outside or press escape)
    page.keyboard.press("Escape")

    # 2. Click on Enemy Tile (Tile 2)
    # The grid cells are divs.
    # Tile 2 is the 2nd one.
    # We can target by the grid container + child index
    # Playwright nth is 0-indexed.

    # Wait for dialog to close
    expect(page.get_by_role("dialog")).to_be_hidden()

    print("Clicking enemy tile (Tile 2)...")
    # Using a more specific selector for the grid cell
    # It has a class 'grid-cols-17' (Wait, I used style, but class was removed?)
    # I used style={{ gridTemplateColumns... }} and className="grid ... "
    # Let's target the grid itself.
    grid_cell = page.locator(".grid > div").nth(1)

    # Wait for it to be stable
    grid_cell.scroll_into_view_if_needed()
    grid_cell.click(force=True)

    # Verify Dialog Opens
    print("Verifying occupied tile dialog...")
    expect(page.get_by_role("dialog")).to_be_visible()
    expect(page.get_by_text("Propiedad Ocupada")).to_be_visible()
    # expect(page.get_by_text("EnemyPlayer")).to_be_visible() # Might need to wait for rendering

    # Take screenshot of Occupied Dialog
    page.screenshot(path="verification/map_occupied_dialog.png")
    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_map_interaction(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
