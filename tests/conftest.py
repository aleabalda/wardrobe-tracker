"""Shared pytest fixtures for the Selenium end-to-end tests.

The app under test is expected to be running already:
  - frontend (Vite)  -> http://localhost:5173
  - backend  (API)   -> http://localhost:3000

Command-line options:
  --browser=chrome|firefox   (default: chrome)
  --headless                 run without opening a browser window
  --base-url=URL             override the frontend URL
"""

import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

TESTS_DIR = Path(__file__).parent
load_dotenv(TESTS_DIR / ".env")

DEFAULT_BASE_URL = os.getenv("BASE_URL", "http://localhost:5173")
DEFAULT_TIMEOUT = 10
SCREENSHOT_DIR = TESTS_DIR / "screenshots"


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


@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url").rstrip("/")


@pytest.fixture
def driver(request):
    """A fresh browser per test, so cookies/auth never leak between tests."""
    drv = _build_driver(
        request.config.getoption("--browser"),
        request.config.getoption("--headless"),
    )
    yield drv
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
def test_user():
    """Credentials for an existing account, read from tests/.env."""
    email = os.getenv("TEST_USER_EMAIL")
    password = os.getenv("TEST_USER_PASSWORD")
    if not email or not password:
        pytest.skip("TEST_USER_EMAIL / TEST_USER_PASSWORD not set in tests/.env")
    return {"email": email, "password": password}


@pytest.fixture
def logged_in_driver(driver, wait, open_page, test_user):
    """A driver that has logged in through the UI and landed on /wardrobe."""
    open_page("/login")
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(test_user["email"])
    driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(test_user["password"])
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("/wardrobe"))
    return driver


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
