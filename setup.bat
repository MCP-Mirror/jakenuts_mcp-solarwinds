@echo off
echo Installing dependencies...
npm install

echo Building project...
npm run build

echo Setup complete!
echo.
echo To use the MCP server, add the configuration to your MCP settings file.
echo Example configurations can be found in the examples directory.
echo.
echo For VSCode Claude extension:
echo - Copy the configuration from examples/vscode-mcp-settings.json or examples/vscode-mcp-settings-windows.json
echo - Add it to your MCP settings file at %APPDATA%\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
echo.
echo For Claude Desktop:
echo - Copy the configuration from examples/claude-desktop-config.json
echo - Add it to your Claude Desktop config file at %APPDATA%\Claude\claude_desktop_config.json
echo.
echo Don't forget to replace "your-api-token" with your actual Papertrail API token!
echo.
echo For development testing, you can use the configuration in examples/jim-config.json
echo.
pause
