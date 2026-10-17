"""Each nav link loads the right page."""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


@pytest.mark.smoke
@pytest.mark.parametrize(
    "link_text, expected_path, heading",
    [
        ("Wardrobe", "/wardrobe", "//main//h2[normalize-space()='All Clothing']"),
        ("Listings", "/listings", "//main//h2[normalize-space()='All Clothing']"),
        ("Outfits", "/outfits", "//main//h1[normalize-space()='Outfits']"),
        ("Profile", "/profile/favourites", "//main//h2[normalize-space()='Favourites']"),
    ],
    ids=["wardrobe", "listings", "outfits", "profile"],
)
def test_nav_link_loads_page(logged_in_driver, wait, link_text, expected_path, heading):
    """Purpose:
        Verifies that each link in the navigation bar opens the correct page.
        The test runs once for each link: Wardrobe, Listings, Outfits and
        Profile.

    Steps:
        1. Log in as the test user (lands on /wardrobe).
        2. Click the nav link being tested.

    Expected result:
        Wardrobe opens /wardrobe with the heading "All Clothing".
        Listings opens /listings with the heading "All Clothing".
        Outfits opens /outfits with the heading "Outfits".
        Profile opens /profile/favourites with the heading "Favourites".
    """
    driver = logged_in_driver

    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, link_text))).click()

    wait.until(EC.url_matches(f"{expected_path}$"))
    assert wait.until(EC.visibility_of_element_located((By.XPATH, heading)))
