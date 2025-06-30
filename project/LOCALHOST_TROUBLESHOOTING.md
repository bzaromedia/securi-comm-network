# Localhost Troubleshooting Guide

This guide provides solutions to common issues that may arise when running the application in a local development environment.

## Issue: Port 8081 is already in use

If you see an error message indicating that port 8081 is already in use, it means another process is occupying the port that the Expo development server needs.

**Solution:**

1.  **Run the `quick-fix.bat` script:**
    This script is designed to automatically kill any process running on port 8081 before starting the development server.

    ```
    c:\bidayax-projects\SecuriComm\project\scripts\quick-fix.bat
    ```

2.  **Manually kill the process:**
    If the script fails, you can manually kill the process by running the following command in your terminal:

    ```
    npx kill-port 8081
    ```

## Issue: Application is not loading correctly

If the application is not loading correctly in your browser, it may be due to a caching issue or outdated dependencies.

**Solution:**

1.  **Run the `quick-fix.bat` script:**
    This script clears the npm and Expo caches, removes old dependencies, and reinstalls them before starting the server. This can resolve many common loading issues.

    ```
    c:\bidayax-projects\SecuriComm\project\scripts\quick-fix.bat
    ```

2.  **Clear your browser cache:**
    Sometimes, the issue may be with your browser's cache. Try clearing your browser's cache and reloading the application.

## Issue: Environment variables are not loaded

If the application is not behaving as expected, it may be because the environment variables are not loaded correctly.

**Solution:**

1.  **Ensure the `.env` file exists:**
    Make sure you have a `.env` file in the root of your project directory (`c:\bidayax-projects\SecuriComm\project`).

2.  **Verify the `.env` file content:**
    Check the content of the `.env` file to ensure that the environment variables are correctly defined. The `quick-fix.bat` script will create a `.env` file from `.env.example` if it does not exist.
