@echo off
set message=%1
if [%message%]==[] (
    echo Please provide a commit message.
    exit /b 1
)
git add .
git commit -m "%message%"
git push origin main
