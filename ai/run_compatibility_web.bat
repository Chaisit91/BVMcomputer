@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python was not found. Install Python and add it to PATH first.
  pause
  exit /b 1
)

python -c "import psycopg2; import PIL" >nul 2>nul
if errorlevel 1 (
  echo Installing required Python packages...
  python -m pip install -r "my-scripts\requirements-postgres.txt"
  if errorlevel 1 (
    echo [ERROR] Could not install the required packages.
    pause
    exit /b 1
  )
)

if defined BUILDCORES_SEED_IMAGES (
  if not defined PGPASSWORD (
    echo Enter the PostgreSQL password. The password will not be displayed.
    for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "$s=Read-Host 'PostgreSQL password' -AsSecureString; $b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}"`) do set "PGPASSWORD=%%P"
  )
  if defined PGPASSWORD (
    echo Saving demo product image URLs to PostgreSQL...
    python "my-scripts\seed_selected_product_images.py"
    if errorlevel 1 echo [WARNING] Product image seeding failed; the catalog will still start.
  ) else (
    echo [WARNING] Product image seeding skipped because PGPASSWORD is empty.
  )
)

set "BUILDCORES_MAXPLUS_KEY_FILE=%LOCALAPPDATA%\BuildCores\maxplus_api_key.dat"

if not defined MAXPLUS_API_KEY if exist "%BUILDCORES_MAXPLUS_KEY_FILE%" (
  for /f "usebackq delims=" %%K in (`powershell -NoProfile -Command "try {$s=Get-Content -Raw -LiteralPath $env:BUILDCORES_MAXPLUS_KEY_FILE | ConvertTo-SecureString; $b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Console]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($b))} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}} catch {exit 1}"`) do set "MAXPLUS_API_KEY=%%K"
)

if not defined MAXPLUS_API_KEY (
  echo Enter MAXPLUS_API_KEY to enable AI build-image generation.
  echo Leave it blank to open the catalog without image generation.
  for /f "usebackq delims=" %%K in (`powershell -NoProfile -Command "$s=Read-Host 'MAXPLUS_API_KEY (ccsk-...)' -AsSecureString; $b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}"`) do (
    set "MAXPLUS_API_KEY=%%K"
    set "BUILDCORES_SAVE_MAXPLUS_KEY=1"
  )
)

if defined BUILDCORES_SAVE_MAXPLUS_KEY (
  powershell -NoProfile -Command "try {$dir=Split-Path -Parent $env:BUILDCORES_MAXPLUS_KEY_FILE; [IO.Directory]::CreateDirectory($dir) | Out-Null; ConvertTo-SecureString $env:MAXPLUS_API_KEY -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -LiteralPath $env:BUILDCORES_MAXPLUS_KEY_FILE -Encoding ASCII} catch {Write-Error $_; exit 1}"
  if errorlevel 1 (
    echo [WARNING] Could not save MAXPLUS_API_KEY. It will be requested again next time.
  ) else (
    echo MAXPLUS_API_KEY was saved securely for this Windows user.
  )
)

if not defined MAXPLUS_API_KEY echo [WARNING] AI build-image generation is disabled because MAXPLUS_API_KEY is empty.

echo Refreshing the compatibility-aware web catalog...
python -B "my-scripts\trim_feature_catalog.py" --keep 50 --apply
if errorlevel 1 (
  echo [ERROR] Could not refresh the web catalog.
  pause
  exit /b 1
)

echo Starting BuildCores at http://127.0.0.1:8000/
echo Press Ctrl+C to stop the server.
python -B -u "my-scripts\compatibility_api.py" --host 127.0.0.1 --port 8000 --open-browser

if errorlevel 1 (
  echo.
  echo [ERROR] The web server stopped unexpectedly.
  pause
)
