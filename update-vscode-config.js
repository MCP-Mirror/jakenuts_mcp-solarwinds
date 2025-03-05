/**
 * Script to update the VSCode Claude extension MCP settings file with the Papertrail MCP server configuration
 * 
 * Usage:
 * node update-vscode-config.js <api-token>
 * 
 * Example:
 * node update-vscode-config.js your-api-token
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get the API token from the command line arguments
const apiToken = process.argv[2];

if (!apiToken) {
  console.error('Error: API token is required');
  console.error('Usage: node update-vscode-config.js <api-token>');
  process.exit(1);
}

// Determine the path to the MCP settings file based on the operating system
let settingsPath;
if (process.platform === 'win32') {
  // Windows
  settingsPath = path.join(
    process.env.APPDATA,
    'Code - Insiders',
    'User',
    'globalStorage',
    'saoudrizwan.claude-dev',
    'settings',
    'cline_mcp_settings.json'
  );
} else if (process.platform === 'darwin') {
  // macOS
  settingsPath = path.join(
    os.homedir(),
    'Library',
    'Application Support',
    'Code',
    'User',
    'globalStorage',
    'saoudrizwan.claude-dev',
    'settings',
    'cline_mcp_settings.json'
  );
} else {
  // Linux
  settingsPath = path.join(
    os.homedir(),
    '.config',
    'Code',
    'User',
    'globalStorage',
    'saoudrizwan.claude-dev',
    'settings',
    'cline_mcp_settings.json'
  );
}

// Check if the settings file exists
if (!fs.existsSync(settingsPath)) {
  console.error(`Error: MCP settings file not found at ${settingsPath}`);
  console.error('Make sure the VSCode Claude extension is installed and has been run at least once.');
  process.exit(1);
}

// Read the settings file
let settings;
try {
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  settings = JSON.parse(settingsContent);
} catch (error) {
  console.error(`Error reading MCP settings file: ${error.message}`);
  process.exit(1);
}

// Create the Papertrail MCP server configuration
const papertrailConfig = {
  command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
  args: ['-y', '@mcp/papertrail'],
  env: {
    PAPERTRAIL_API_TOKEN: apiToken
  },
  autoApprove: [],
  disabled: false
};

// Update the settings
if (!settings.mcpServers) {
  settings.mcpServers = {};
}
settings.mcpServers.papertrail = papertrailConfig;

// Write the updated settings back to the file
try {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  console.log(`Successfully updated MCP settings file at ${settingsPath}`);
  console.log('The Papertrail MCP server has been added to your VSCode Claude extension configuration.');
} catch (error) {
  console.error(`Error writing MCP settings file: ${error.message}`);
  process.exit(1);
}
