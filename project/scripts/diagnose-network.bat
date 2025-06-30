@echo off
setlocal

echo.
echo ==================================================
echo         SecuriComm Network Diagnostic Tool
echo ==================================================
echo.

rem --- 1. Check Internet Connection ---
echo [1/4] Checking internet connection...
ping 8.8.8.8 -n 1 | find "TTL=" >nul
if errorlevel 1 (
    echo    Error: No internet connection detected.
    echo    Please check your network cables and reboot your router.
) else (
    echo    Internet connection is active.
)

rem --- 2. Check Firewall Status ---
echo [2/4] Checking Windows Firewall status...
netsh advfirewall show allprofiles | find "State" | find "ON" >nul
if errorlevel 1 (
    echo    Firewall is currently OFF.
) else (
    echo    Firewall is ON.
)

rem --- 3. Add Firewall Rule for Node.js ---
echo [3/4] Adding firewall rule for Node.js...
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes >nul
echo    Firewall rule for Node.js has been added or updated.

rem --- 4. Reset Proxy Settings ---
echo [4/4] Checking and resetting proxy settings...
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" | find "ProxyEnable" | find "0x1" >nul
if errorlevel 1 (
    echo    Proxy server is already disabled.
) else (
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f >nul
    echo    Proxy server has been disabled.
)

echo.
echo ==================================================
echo            Network diagnostics complete.
echo ==================================================
echo.
