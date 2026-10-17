"""Login, registration, logout and route protection."""

import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import helpers


def test_login_success(driver, wait, open_page, test_user):
    """Purpose:
        Verifies that a registered user can log in with valid credentials and
        is taken into the protected part of the site.

    Steps:
        1. Open the login page (/login).
        2. Enter the test user's email and password.
        3. Click the "Log in" button.

    Expected result:
        The browser is redirected to /wardrobe, and the "Logout" button and
        "Wardrobe" nav link (only shown to logged-in users) are visible.
    """
    open_page("/login")
    helpers.submit_login(driver, wait, test_user["email"], test_user["password"])

    wait.until(EC.url_contains("/wardrobe"))
    # Only logged-in users see the Logout button and the nav links.
    assert wait.until(EC.visibility_of_element_located(helpers.LOGOUT_BUTTON))
    assert driver.find_element(By.LINK_TEXT, "Wardrobe").is_displayed()


def test_login_wrong_password(driver, wait, open_page, test_user):
    """Purpose:
        Verifies that logging in with a correct email but an incorrect
        password is rejected.

    Steps:
        1. Open the login page (/login).
        2. Enter the test user's email and a wrong password.
        3. Click the "Log in" button.

    Expected result:
        The error message "Invalid credentials" is displayed and the browser
        stays on /login.
    """
    open_page("/login")
    helpers.submit_login(driver, wait, test_user["email"], "definitely-wrong-password")

    error = wait.until(EC.visibility_of_element_located(helpers.LOGIN_ERROR))
    assert error.text == "Invalid credentials"
    assert driver.current_url.endswith("/login")


def test_login_empty_fields(driver, wait, open_page):
    """Purpose:
        Verifies that submitting the login form with no email or password does
        not log the user in.

    Steps:
        1. Open the login page (/login).
        2. Leave the email and password fields empty.
        3. Click the "Log in" button.

    Expected result:
        An error message is displayed and the browser stays on /login.
    """
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
    """Purpose:
        Verifies that a new visitor can create an account and then log in
        with it.

    Steps:
        1. Open the registration page (/register).
        2. Enter a first name, last name, unique username, unique email
           (made unique with a timestamp) and a password.
        3. Click the "Create Account" button.
        4. On the login page, enter the new email and password and click
           "Log in".

    Expected result:
        After registering, the browser is redirected to /login. Logging in
        with the new account redirects to /wardrobe and shows the "Logout"
        button.
    """
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
    """Purpose:
        Verifies that an account cannot be registered with an email address
        that is already in use.

    Steps:
        1. Open the registration page (/register).
        2. Enter a first name, last name, a new unique username, the email of
           an existing account, and a password.
        3. Click the "Create Account" button.

    Expected result:
        The error message "Email or username already in use" is displayed and
        the browser stays on /register.
    """
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
    """Purpose:
        Verifies that logging out ends the user's session.

    Steps:
        1. Log in as the test user (lands on /wardrobe).
        2. Click the "Logout" button in the header.
        3. Navigate directly to /wardrobe.

    Expected result:
        After clicking "Logout" the browser is redirected to /login, and
        visiting /wardrobe afterwards redirects to /login again instead of
        showing the wardrobe.
    """
    driver = logged_in_driver
    driver.find_element(*helpers.LOGOUT_BUTTON).click()

    # Logging out on a protected page bounces the user to /login.
    wait.until(EC.url_contains("/login"))

    # And the session is really gone: /wardrobe redirects again.
    open_page("/wardrobe")
    wait.until(EC.url_contains("/login"))
    assert "/wardrobe" not in driver.current_url


def test_protected_page_redirects_when_logged_out(driver, wait, open_page):
    """Purpose:
        Verifies that protected pages cannot be viewed without logging in.

    Steps:
        1. Without logging in, navigate directly to /wardrobe.

    Expected result:
        The browser is redirected to /login.
    """
    open_page("/wardrobe")

    wait.until(EC.url_contains("/login"))
    assert driver.current_url.endswith("/login")
