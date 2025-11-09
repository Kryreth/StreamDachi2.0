<<<<<<< HEAD
; TwitchMind Installer - No-warnings build (shell EXE optional)

=======
; Minimal TwitchMind installer (only required pieces)
>>>>>>> 31dbe52 (2025-11-09 16:21:47 sync)
Outfile "TwitchMindSetup.exe"
InstallDir "$PROGRAMFILES\TwitchMind"
RequestExecutionLevel admin

Section "Install"
<<<<<<< HEAD
  ; Root
  SetOutPath "$INSTDIR"
  File "run.cmd"
  File "app.ico"

  ; ---- Node runtime (support either layout) ----
!ifexist "node\node.exe"
  CreateDirectory "$INSTDIR\node"
  SetOutPath "$INSTDIR\node"
  File "node\node.exe"
!elseifexist "node.exe"
  CreateDirectory "$INSTDIR\node"
  SetOutPath "$INSTDIR\node"
  File "node.exe"
!endif

  ; ---- Server ----
=======
  SetOutPath "$INSTDIR"
  File "run.cmd"

  CreateDirectory "$INSTDIR\node"
  SetOutPath "$INSTDIR\node"
  File "node\node.exe"

>>>>>>> 31dbe52 (2025-11-09 16:21:47 sync)
  CreateDirectory "$INSTDIR\server\dist"
  SetOutPath "$INSTDIR\server\dist"
  File /r "server\dist\*.*"

<<<<<<< HEAD
  ; ---- Client build ----
=======
>>>>>>> 31dbe52 (2025-11-09 16:21:47 sync)
  CreateDirectory "$INSTDIR\client\dist"
  SetOutPath "$INSTDIR\client\dist"
  File /r "client\dist\*.*"

<<<<<<< HEAD
  ; Public (source of favicon fallback)
  CreateDirectory "$INSTDIR\client\public"
  SetOutPath "$INSTDIR\client\public"
!ifexist "client\public\favicon.ico"
  File "client\public\favicon.ico"
!endif

  ; ---- Optional shell app (avoid compile-time warning) ----
  CreateDirectory "$INSTDIR\shell"
  SetOutPath "$INSTDIR\shell"
!ifexist "shell\TwitchMindShell.exe"
  File "shell\TwitchMindShell.exe"
!endif

  ; ---- Shortcuts (StreamDachi) ----
  ; Clean old desktop link
  Delete "$DESKTOP\TwitchMind.lnk"

  ; Desktop: prefer shell if present at install-time; otherwise run.cmd
  IfFileExists "$INSTDIR\shell\TwitchMindShell.exe" +2 0
    CreateShortCut "$DESKTOP\StreamDachi.lnk" "$INSTDIR\shell\TwitchMindShell.exe" "" "$INSTDIR\app.ico" 0
    Goto +2
  CreateShortCut "$DESKTOP\StreamDachi.lnk" "$INSTDIR\run.cmd" "" "$INSTDIR\app.ico" 0

  ; Start Menu group
  CreateDirectory "$SMPROGRAMS\StreamDachi"
  IfFileExists "$INSTDIR\shell\TwitchMindShell.exe" +2 0
    CreateShortCut "$SMPROGRAMS\StreamDachi\StreamDachi.lnk" "$INSTDIR\shell\TwitchMindShell.exe" "" "$INSTDIR\app.ico" 0
    Goto +2
  CreateShortCut "$SMPROGRAMS\StreamDachi\StreamDachi.lnk" "$INSTDIR\run.cmd" "" "$INSTDIR\app.ico" 0
  CreateShortCut "$SMPROGRAMS\StreamDachi\Uninstall.lnk" "$INSTDIR\Uninstall.exe"

  ; Ensure favicon exists in dist (overwrite to guarantee update)
!ifexist "$%CD%\client\public\favicon.ico"
  CopyFiles /SILENT "$INSTDIR\client\public\favicon.ico" "$INSTDIR\client\dist\favicon.ico"
!endif

  ; Uninstaller
=======
  CreateShortCut "$DESKTOP\TwitchMind.lnk" "$INSTDIR\run.cmd"
>>>>>>> 31dbe52 (2025-11-09 16:21:47 sync)
  SetOutPath "$INSTDIR"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
<<<<<<< HEAD
  Delete "$DESKTOP\StreamDachi.lnk"
  Delete "$SMPROGRAMS\StreamDachi\StreamDachi.lnk"
  Delete "$SMPROGRAMS\StreamDachi\Uninstall.lnk"
  RMDir "$SMPROGRAMS\StreamDachi"

  RMDir /r "$INSTDIR\client"
  RMDir /r "$INSTDIR\server"
  RMDir /r "$INSTDIR\node"
  RMDir /r "$INSTDIR\shell"
  Delete "$INSTDIR\app.ico"
=======
  Delete "$DESKTOP\TwitchMind.lnk"
  RMDir /r "$INSTDIR\client"
  RMDir /r "$INSTDIR\server"
  RMDir /r "$INSTDIR\node"
>>>>>>> 31dbe52 (2025-11-09 16:21:47 sync)
  Delete "$INSTDIR\run.cmd"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
SectionEnd
