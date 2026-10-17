"""Adding, viewing and deleting clothing items.

Every item a test creates is registered with `cleanup_items` so it is deleted
afterwards (including its image on Cloudinary), even if the test fails.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import helpers


def _wardrobe_names(driver):
    return [item["name"] for item in helpers.fetch_wardrobe_items(driver)]


def test_add_item_appears_in_wardrobe(
    logged_in_driver, wait, test_image, unique_name, cleanup_items
):
    """Purpose:
        Verifies that a user can add a clothing item and that it is saved
        with the details they entered.

    Steps:
        1. Log in as the test user (lands on /wardrobe).
        2. Click "Add" to open the "Add Clothing Item" form.
        3. Enter a unique name, brand "Uniqlo", type "Tops", size "L",
           color "Navy", and choose an image file.
        4. Click "Add Item".
        5. Click the new item's card to open its detail page.

    Expected result:
        The new item's card appears in the wardrobe showing "Uniqlo | Size L".
        Its detail page shows the item name as the heading and lists
        "Brand: Uniqlo", "Type: Tops", "Color: Navy" and "Size: L".
    """
    driver = logged_in_driver
    cleanup_items.append(unique_name)

    card = helpers.add_item(
        driver,
        wait,
        unique_name,
        test_image,
        brand="Uniqlo",
        item_type="Tops",
        size="L",
        color="Navy",
    )

    # The card in the grid shows the brand and size...
    summary = card.find_element(By.XPATH, "following-sibling::p")
    assert summary.text == "Uniqlo | Size L"

    # ...and the detail page shows everything that was entered.
    card.click()
    wait.until(EC.visibility_of_element_located(helpers.item_heading(unique_name)))
    details = driver.find_element(By.TAG_NAME, "main").text
    assert "Brand: Uniqlo" in details
    assert "Type: Tops" in details
    assert "Color: Navy" in details
    assert "Size: L" in details


def test_added_item_persists_after_refresh(
    logged_in_driver, wait, test_image, unique_name, cleanup_items
):
    """Purpose:
        Verifies that added clothing items are stored in the database, not
        just shown on the page.

    Steps:
        1. Log in as the test user (lands on /wardrobe).
        2. Add a clothing item with a unique name, type, size, color and
           image.
        3. Reload the page in the browser.

    Expected result:
        After the reload, the new item's card is still displayed in the
        wardrobe.
    """
    driver = logged_in_driver
    cleanup_items.append(unique_name)
    helpers.add_item(driver, wait, unique_name, test_image)

    driver.refresh()

    assert wait.until(EC.visibility_of_element_located(helpers.item_card_link(unique_name)))


def test_add_item_missing_required_fields(logged_in_driver, wait, unique_name):
    """Purpose:
        Verifies that the add item form cannot be submitted when required
        fields are empty.

    Steps:
        1. Log in as the test user (lands on /wardrobe).
        2. Click "Add" to open the "Add Clothing Item" form.
        3. Leave every field empty and click "Add Item".

    Expected result:
        The browser's required-field validation stops the submission (the
        Name field is flagged as missing with a validation message), the form
        stays open, and no item is saved to the wardrobe.
    """
    driver = logged_in_driver
    helpers.open_add_item_form(driver, wait)

    # Submit with nothing filled in; the browser's `required` check blocks it.
    driver.find_element(*helpers.ADD_ITEM_SUBMIT).click()

    name_input = driver.find_element(*helpers.NAME_INPUT)
    assert driver.execute_script("return arguments[0].validity.valueMissing", name_input)
    assert name_input.get_attribute("validationMessage") != ""
    # The form is still open and nothing was saved.
    assert driver.find_element(*helpers.ADD_ITEM_FORM_TITLE).is_displayed()
    assert unique_name not in _wardrobe_names(driver)


def test_add_item_without_image_shows_alert(logged_in_driver, wait, unique_name):
    """Purpose:
        Verifies that a clothing item cannot be added without an image.

    Steps:
        1. Log in as the test user (lands on /wardrobe).
        2. Click "Add" to open the "Add Clothing Item" form.
        3. Enter a unique name, type "Shoes", size "9" and color "White", but
           do not choose an image.
        4. Click "Add Item".

    Expected result:
        A browser alert appears with the message "Please select an image",
        and no item is saved to the wardrobe.
    """
    driver = logged_in_driver
    helpers.open_add_item_form(driver, wait)
    helpers.fill_add_item_form(
        driver, name=unique_name, item_type="Shoes", size="9", color="White"
    )

    driver.find_element(*helpers.ADD_ITEM_SUBMIT).click()

    alert = wait.until(EC.alert_is_present())
    assert alert.text == "Please select an image"
    alert.accept()
    assert unique_name not in _wardrobe_names(driver)


def test_delete_item(logged_in_driver, wait, test_image, unique_name, cleanup_items):
    """Purpose:
        Verifies that a user can delete a clothing item from their wardrobe.

    Steps:
        1. Log in as the test user (lands on /wardrobe).
        2. Add a clothing item with a unique name.
        3. Click the item's card to open its detail page.
        4. Click the "Delete" button.

    Expected result:
        The browser is redirected back to /wardrobe, the item's card is no
        longer displayed, and the item no longer exists in the user's saved
        wardrobe.
    """
    driver = logged_in_driver
    cleanup_items.append(unique_name)
    helpers.add_item(driver, wait, unique_name, test_image).click()

    wait.until(EC.visibility_of_element_located(helpers.item_heading(unique_name)))
    driver.find_element(*helpers.button_with_text("Delete")).click()

    # Deleting sends the user back to the wardrobe without the item.
    wait.until(EC.url_matches(r"/wardrobe$"))
    assert unique_name not in _wardrobe_names(driver)
    assert driver.find_elements(*helpers.item_card_link(unique_name)) == []
