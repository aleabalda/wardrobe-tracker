"""Login, registration, logout and route protection."""

import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import helpers


def test_login_success(driver, wait, open_page, test_user):
    open_page("/login")
    helpers.submit_login(driver, wait, test_user["email"], test_user["password"])

    wait.until(EC.url_contains("/wardrobe"))
    # Only logged-in users see the Logout button and the nav links.
    assert wait.until(EC.visibility_of_element_located(helpers.LOGOUT_BUTTON))
    assert driver.find_element(By.LINK_TEXT, "Wardrobe").is_displayed()


def test_login_wrong_password(driver, wait, open_page, test_user):
    open_page("/login")
    helpers.submit_login(driver, wait, test_user["email"], "definitely-wrong-password")

    error = wait.until(EC.visibility_of_element_located(helpers.LOGIN_ERROR))
    assert error.text == "Invalid credentials"
    assert driver.current_url.endswith("/login")


def test_login_empty_fields(driver, wait, open_page):
    # The login inputs aren't marked `required`, so the browser lets the form
    # submit and the backend rejects it.
    open_page("/login")
    wait.until(EC.element_to_be_clickable(helpers.LOGIN_SUBMIT)).click()

    error = wait.until(EC.visibility_of_element_located(helpers.LOGIN_ERROR))
    assert error.text != ""
    assert driver.current_url.endswith("/login")


def _fill_register_form(driver, wait, email, username, password):
    wait.until(EC.visibility_of_element_located((By.ID, "first-name"))).send_keys("Selenium")
    driver.find_element(By.ID, "last-name").send_keys("Tester")
    driver.find_element(By.ID, "username").send_keys(username)
    driver.find_element(By.ID, "email").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(*helpers.button_with_text("Create Account")).click()


def test_register_new_user(driver, wait, open_page):
    stamp = int(time.time() * 1000)
    email = f"register_{stamp}@example.com"
    password = "Password123!"

    open_page("/register")
    _fill_register_form(driver, wait, email, f"register_{stamp}", password)

    # A successful sign-up sends the user to the login page...
    wait.until(EC.url_contains("/login"))

    # ...and the new account can actually log in.
    helpers.submit_login(driver, wait, email, password)
    wait.until(EC.url_contains("/wardrobe"))
    assert wait.until(EC.visibility_of_element_located(helpers.LOGOUT_BUTTON))


def test_register_existing_email(driver, wait, open_page, test_user):
    open_page("/register")
    # Unique username, so the email is the only thing that clashes.
    _fill_register_form(
        driver,
        wait,
        test_user["email"],
        f"dupe_{int(time.time() * 1000)}",
        "Password123!",
    )

    error = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//form/p[contains(., 'already in use')]"))
    )
    assert "Email or username already in use" in error.text
    assert driver.current_url.endswith("/register")


def test_logout(logged_in_driver, wait, open_page):
    driver = logged_in_driver
    driver.find_element(*helpers.LOGOUT_BUTTON).click()

    # Logging out on a protected page bounces the user to /login.
    wait.until(EC.url_contains("/login"))

    # And the session is really gone: /wardrobe redirects again.
    open_page("/wardrobe")
    wait.until(EC.url_contains("/login"))
    assert "/wardrobe" not in driver.current_url


def test_protected_page_redirects_when_logged_out(driver, wait, open_page):
    open_page("/wardrobe")

    wait.until(EC.url_contains("/login"))
    assert driver.current_url.endswith("/login")
