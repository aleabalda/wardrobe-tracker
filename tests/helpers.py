"""Locators and small helper functions shared by the tests."""

import os

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


def api_url():
    return os.getenv("API_URL", "http://localhost:3000/api")


# --- Locators -------------------------------------------------------------

LOGIN_EMAIL = (By.CSS_SELECTOR, "input[type='email']")
LOGIN_PASSWORD = (By.CSS_SELECTOR, "input[type='password']")
LOGIN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
LOGIN_ERROR = (By.CSS_SELECTOR, "form p.text-red-600")

LOGOUT_BUTTON = (By.XPATH, "//header//button[normalize-space()='Logout']")

ADD_ITEM_BUTTON = (By.XPATH, "//li[normalize-space()='Add']")
ADD_ITEM_FORM_TITLE = (By.XPATH, "//form//h2[normalize-space()='Add Clothing Item']")
NAME_INPUT = (By.ID, "name-input")
BRAND_INPUT = (By.ID, "brand-input")
TYPE_SELECT = (By.ID, "type-input")
SIZE_INPUT = (By.ID, "size-input")
COLOR_INPUT = (By.ID, "color-input")
IMAGE_INPUT = (By.ID, "image-input")
DESCRIPTION_INPUT = (By.ID, "description-input")
ADD_ITEM_SUBMIT = (By.XPATH, "//form//button[normalize-space()='Add Item']")

# Uploads go to Cloudinary, so allow longer than the default wait.
UPLOAD_TIMEOUT = 30


def item_card_link(name):
    """The clickable card for a clothing item in the wardrobe grid."""
    return (By.CSS_SELECTOR, f"a[aria-label='View details for {name}']")


def item_heading(name):
    """The item name heading on a clothing item's detail page."""
    return (By.XPATH, f"//h1[normalize-space()='{name}']")


def button_with_text(text):
    return (By.XPATH, f"//button[normalize-space()='{text}']")


# --- Actions --------------------------------------------------------------


def submit_login(driver, wait, email, password):
    wait.until(EC.visibility_of_element_located(LOGIN_EMAIL)).send_keys(email)
    driver.find_element(*LOGIN_PASSWORD).send_keys(password)
    driver.find_element(*LOGIN_SUBMIT).click()


def open_add_item_form(driver, wait):
    wait.until(EC.element_to_be_clickable(ADD_ITEM_BUTTON)).click()
    wait.until(EC.visibility_of_element_located(ADD_ITEM_FORM_TITLE))


def fill_add_item_form(
    driver, name=None, brand=None, item_type=None, size=None, color=None, image_path=None
):
    """Fill in whichever fields are given; leave the rest empty."""
    if name:
        driver.find_element(*NAME_INPUT).send_keys(name)
    if brand:
        driver.find_element(*BRAND_INPUT).send_keys(brand)
    if item_type:
        Select(driver.find_element(*TYPE_SELECT)).select_by_visible_text(item_type)
    if size:
        driver.find_element(*SIZE_INPUT).send_keys(size)
    if color:
        driver.find_element(*COLOR_INPUT).send_keys(color)
    if image_path:
        driver.find_element(*IMAGE_INPUT).send_keys(image_path)


def add_item(
    driver, wait, name, image_path, brand="Selenium", item_type="Tops", size="M", color="Navy"
):
    """Add an item through the UI and wait until its card shows in the wardrobe."""
    open_add_item_form(driver, wait)
    fill_add_item_form(
        driver,
        name=name,
        brand=brand,
        item_type=item_type,
        size=size,
        color=color,
        image_path=image_path,
    )
    driver.find_element(*ADD_ITEM_SUBMIT).click()
    # The form uploads the image, then reloads the page.
    return WebDriverWait(driver, UPLOAD_TIMEOUT).until(
        EC.visibility_of_element_located(item_card_link(name))
    )


# --- Direct API checks (run inside the logged-in browser) ------------------
# These use the browser's own login cookie, so they see exactly what the
# signed-in user would. Useful for confirming something is really gone
# rather than just not rendered yet.


def fetch_wardrobe_items(driver):
    return driver.execute_async_script(
        """
        const done = arguments[arguments.length - 1];
        fetch(arguments[0] + "/clothing/get", { credentials: "include" })
          .then((res) => (res.ok ? res.json() : []))
          .then(done)
          .catch(() => done([]));
        """,
        api_url(),
    )


def delete_item_via_api(driver, item_id):
    driver.execute_async_script(
        """
        const done = arguments[arguments.length - 1];
        fetch(arguments[0] + "/clothing/" + arguments[1], {
          method: "DELETE",
          credentials: "include",
        }).finally(() => done());
        """,
        api_url(),
        item_id,
    )
