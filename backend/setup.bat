@echo off
echo ============================================
echo Soccer Analytics Setup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Python found!
echo.

REM Create virtual environment
echo [2/4] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo Virtual environment created successfully!
echo.

REM Activate virtual environment and install dependencies
echo [3/4] Installing dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

REM Create necessary directories
echo [4/4] Creating project directories...
if not exist "input_videos" mkdir input_videos
if not exist "output_images" mkdir output_images
if not exist "stubs" mkdir stubs
echo Directories created successfully!
echo.

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo To run the project:
echo   1. Activate virtual environment: venv\Scripts\activate.bat
echo   2. Place your video in input_videos folder
echo   3. Run: python main.py
echo.
pause
