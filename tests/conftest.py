import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.events import AbstractEventListener, EventFiringWebDriver
from selenium.webdriver.support.ui import WebDriverWait

import helpers

TESTS_DIR = Path(__file__).parent
load_dotenv(TESTS_DIR / ".env")

DEFAULT_BASE_URL = os.getenv("BASE_URL", "http://localhost:5173")
DEFAULT_TIMEOUT = 10
SCREENSHOT_DIR = TESTS_DIR / "screenshots"
TEST_IMAGE = TESTS_DIR / "fixtures" / "test-item.jpg"


def pytest_addoption(parser):
    parser.addoption(
        "--browser",
        action="store",
        default=os.getenv("BROWSER", "chrome"),
        choices=["chrome", "firefox"],
        help="Browser to run the tests in.",
    )
    parser.addoption(
        "--headless",
        action="store_true",
        default=os.getenv("HEADLESS", "").lower() in ("1", "true", "yes"),
        help="Run the browser in headless mode.",
    )
    parser.addoption(
        "--base-url",
        action="store",
        default=DEFAULT_BASE_URL,
        help="Base URL of the frontend under test.",
    )
    parser.addoption(
        "--slow-mo",
        action="store",
        type=float,
        default=float(os.getenv("SLOW_MO", "0")),
        help="Seconds to pause after each browser action (0 = full speed).",
    )


class _SlowMoListener(AbstractEventListener):
    """Pauses after each user-visible action so a human can follow along."""

    def __init__(self, delay):
        self.delay = delay

    def after_navigate_to(self, url, driver):
        time.sleep(self.delay)

    def after_click(self, element, driver):
        time.sleep(self.delay)

    def after_change_value_of(self, element, driver):
        time.sleep(self.delay)


def _build_driver(browser, headless):
    if browser == "firefox":
        options = webdriver.FirefoxOptions()
        if headless:
            options.add_argument("-headless")
        options.add_argument("--width=1400")
        options.add_argument("--height=900")
        return webdriver.Firefox(options=options)

    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1400,900")
    options.add_argument("--disable-search-engine-choice-screen")
    return webdriver.Chrome(options=options)


def _register_user_via_api(user):
    request = urllib.request.Request(
        f"{helpers.api_url()}/auth/register",
        data=json.dumps(user).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(request, timeout=10)
    except urllib.error.URLError as err:
        pytest.exit(
            f"Could not register a test user at {helpers.api_url()} - "
            f"is the backend running? ({err})"
        )


@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url").rstrip("/")


@pytest.fixture(scope="session")
def test_user():
    """Credentials for an account the tests can log in with.

    Uses TEST_USER_EMAIL / TEST_USER_PASSWORD from tests/.env if set, otherwise
    registers a brand-new user through the API once per test run, so tests
    never touch your real wardrobe.
    """
    email = os.getenv("TEST_USER_EMAIL")
    password = os.getenv("TEST_USER_PASSWORD")
    if email and password:
        return {"email": email, "password": password}

    stamp = int(time.time() * 1000)
    user = {
        "firstName": "Selenium",
        "lastName": "Tester",
        "phoneNumber": "",
        "email": f"selenium_{stamp}@example.com",
        "username": f"selenium_{stamp}",
        "password": "Password123!",
    }
    _register_user_via_api(user)
    return {"email": user["email"], "password": user["password"]}


@pytest.fixture
def driver(request):
    """A fresh browser per test, so cookies/auth never leak between tests."""
    drv = _build_driver(
        request.config.getoption("--browser"),
        request.config.getoption("--headless"),
    )
    slow_mo = request.config.getoption("--slow-mo")
    if slow_mo > 0:
        drv = EventFiringWebDriver(drv, _SlowMoListener(slow_mo))
    yield drv
    if slow_mo > 0:
        # Linger on the final screen so the end result is visible in a recording.
        time.sleep(slow_mo * 2)
    drv.quit()


@pytest.fixture
def wait(driver):
    """Explicit wait helper: wait.until(EC.visibility_of_element_located(...))."""
    return WebDriverWait(driver, DEFAULT_TIMEOUT)


@pytest.fixture
def open_page(driver, base_url):
    """Navigate to a path relative to the base URL, e.g. open_page("/login")."""

    def _open(path="/"):
        driver.get(f"{base_url}/{path.lstrip('/')}")
        return driver

    return _open


@pytest.fixture
def logged_in_driver(driver, wait, open_page, test_user):
    """A driver that has logged in through the UI and landed on /wardrobe."""
    open_page("/login")
    helpers.submit_login(driver, wait, test_user["email"], test_user["password"])
    wait.until(EC.url_contains("/wardrobe"))
    wait.until(EC.visibility_of_element_located(helpers.LOGOUT_BUTTON))
    return driver


@pytest.fixture
def test_image():
    """Absolute path to a small JPEG used when uploading clothing items."""
    return str(TEST_IMAGE.resolve())


@pytest.fixture
def unique_name():
    """A clothing item name that is different every run."""
    return f"Selenium Item {int(time.time() * 1000)}"


@pytest.fixture
def cleanup_items(logged_in_driver):
    """Collects names of items a test creates and deletes them afterwards.

    Usage: cleanup_items.append(name) right after creating an item.
    """
    names = []
    yield names
    for item in helpers.fetch_wardrobe_items(logged_in_driver):
        if item["name"] in names:
            helpers.delete_item_via_api(logged_in_driver, item["id"])


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Save a screenshot whenever a test fails, to help debugging."""
    outcome = yield
    report = outcome.get_result()
    if report.when != "call" or not report.failed:
        return
    drv = item.funcargs.get("driver") or item.funcargs.get("logged_in_driver")
    if drv is None:
        return
    SCREENSHOT_DIR.mkdir(exist_ok=True)
    drv.save_screenshot(str(SCREENSHOT_DIR / f"{item.name}.png"))
