import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the login page
        page.goto("http://localhost:5173/login", timeout=60000)

        # Fill in the login form
        page.get_by_placeholder("Email").fill("support@drzelisko.com")
        page.get_by_placeholder("Password").fill("Amp!225723!")
        page.get_by_role("button", name="Sign In").click()

        # Wait for navigation to the dashboard after login
        expect(page).to_have_url(re.compile(".*/dashboard"), timeout=15000)

        # Find the Exposure Ladder widget
        ladder_widget = page.locator("div:has(> h3:has-text('Exposure Ladder'))").first
        expect(ladder_widget).to_be_visible()

        # Click the "Generate with AI" button to show the form
        generate_button = ladder_widget.get_by_role("button", name="Generate with AI")
        generate_button.click()

        # Fill in the fear input
        fear_input = ladder_widget.get_by_label("What are you afraid of?")
        expect(fear_input).to_be_visible()
        fear_input.fill("Fear of public speaking")

        # Click the "Generate Ladder" button
        generate_ladder_button = ladder_widget.get_by_role("button", name="Generate Ladder")
        generate_ladder_button.click()

        # Wait for the ladder steps to appear. Each step is a div inside the main steps container.
        # We'll wait for at least one step to be visible.
        ladder_steps_container = ladder_widget.locator("div.sc-jIZahH.crATEG")
        expect(ladder_steps_container.locator("div.sc-bsDpAt")).to_have_count(lambda count: count > 0, timeout=30000)

        # Take a screenshot of the widget
        ladder_widget.screenshot(path="jules-scratch/verification/exposure_ladder_verification.png")

        print("Verification script for exposure ladder completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/exposure_ladder_error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)