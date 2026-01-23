# Previewing an OpenAPI spec in VS Code with a Swagger UI extension


- ## Install the extension
    - Open Extensions (Ctrl+Shift+X).
    - Search for "Swagger UI Preview" (or simply "swagger ui" / "swagger viewer") and click Install.

- ## Open the spec file
    - Open your workspace root in VS Code (File → Open Folder) so `/openapi-specification.yml` is visible.
    - Open the file `openapi-specification.yml` in the editor and save it.

- ## Open the preview
    - Open the Command Palette (Ctrl+Shift+P).
    - Type "swagger" (or "swagger ui") and pick the extension command that shows a preview, for example "Swagger UI: Preview" or "Swagger UI Preview: Open".
    - The extension will render the OpenAPI spec in a webview or open a local preview URL in your browser.

- ## Troubleshooting / tips
    - If no command appears, ensure the extension is enabled and reload the window (Developer: Reload Window).
    - Make sure the file extension is `.yml` or `.yaml` and that the content is a valid OpenAPI (v2/v3) document.
    - Some extensions also provide a right-click editor command ("Open Preview" / "Preview Swagger") or a status bar button.
    - If the preview opens a localhost URL, you can open that URL in an external browser for full Swagger UI controls.