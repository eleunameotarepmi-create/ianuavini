$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\Ianua Vini.lnk")
$Shortcut.TargetPath = "c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\IanuaViniLauncher.bat"
$Shortcut.WorkingDirectory = "c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2"
$Shortcut.IconLocation = "c:\Users\Urukk\.gemini\antigravity\scratch\ianua-vini-v2\app.ico"
$Shortcut.WindowStyle = 7 # Minimized (optional, but keep default normal usually. 1=Normal, 3=Max, 7=Min. 1 is safer)
$Shortcut.Save()
Write-Host "Shortcut created on Desktop: $DesktopPath\Ianua Vini.lnk"
