; Nyx Crawler Bot Installer
; Custom NSIS installer template with Nyx branding

!include "MUI2.nsh"
!include "FileFunc.nsh"

; Installer configuration
!define PRODUCT_NAME "Nyx Crawler Bot"
!define PRODUCT_VERSION "${VERSION}"
!define PRODUCT_PUBLISHER "Nyx"
!define PRODUCT_WEB_SITE "https://github.com/kaunda-a/nyx-automation"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\${MAIN_BINARY_NAME}.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; Installer settings
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${OUT_FILE}"
InstallDir "$PROGRAMFILES\${PRODUCT_NAME}"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

; Request admin privileges
RequestExecutionLevel admin

; Modern UI Configuration
!define MUI_ABORTWARNING

; Installer icons - use our own icon
!define MUI_ICON "${ICON_PATH}"
!define MUI_UNICON "${ICON_PATH}"

; Welcome page
!define MUI_WELCOMEPAGE_TITLE "Welcome to the ${PRODUCT_NAME} Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of ${PRODUCT_NAME}.\r\n\r\nClick Next to continue."

; License page
!insertmacro MUI_PAGE_LICENSE "${LICENSE_FILE}"

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Installation page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\${MAIN_BINARY_NAME}.exe"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer sections
Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  
  ; Main application files
  File "${MAIN_BINARY_NAME}.exe"
  
  ; Additional resources (if any)
  SetOutPath "$INSTDIR\resources"
  File /r "resources\*.*"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\uninst.exe"
  
  ; Registry entries
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\${MAIN_BINARY_NAME}.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\${MAIN_BINARY_NAME}.exe,0"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd

; Desktop shortcut section
Section -AdditionalIcons
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${MAIN_BINARY_NAME}.exe"
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Remove files
  Delete "$INSTDIR\${MAIN_BINARY_NAME}.exe"
  RMDir /r "$INSTDIR\resources"
  
  ; Remove shortcuts
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  
  ; Remove directories
  RMDir "$INSTDIR"
  
  ; Remove registry entries
  DeleteRegKey HKLM "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
SectionEnd

; Installer functions
Function .onInit
  ; Check if already installed
  ReadRegStr $R0 HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
  StrCmp $R0 "" +2
    MessageBox MB_OK|MB_ICONEXCLAMATION "Previous version detected. Please uninstall it first." IDOK +1
    Abort
FunctionEnd