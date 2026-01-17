@echo off
echo Soccer Analytics - Running Analysis
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Activate virtual environment and run
call venv\Scripts\activate.bat
python main.py

echo.
echo Check output_videos folder for results
pause
