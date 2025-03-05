/**
 * Script to update the Claude Desktop config file with the Papertrail MCP server configuration
 * 
 * Usage:
 * node update-claude-desktop-config.js <api-token>
 * 
 * Example:
 * node update-claude-desktop-config.js your-api-token
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get the API token from the command line arguments
const apiToken = process.argv[2];

if (!apiToken) {
  console.error('Error: API token is required');
  console.error('Usage: node update-claude-desktop-config.js <api-token>');
  process.exit(1);
}

// Determine the path to the Claude Desktop config file based on the operating system
let configPath;
if (process.platform === 'win32') {
  // Windows
  configPath = path.join(
    process.env.APPDATA,
    'Claude',
    'claude_desktop_config.json'
  );
} else if (process.platform === 'darwin') {
  // macOS
  configPath = path.join(
    os.homedir(),
    'Library',
    'Application Support',
    'Claude',
    'claude_desktop_config.json'
  );
} else {
  // Linux
  configPath = path.join(
    os.homedir(),
    '.config',
    'Claude',
    'claude_desktop_config.json'
  );
}

// Check if the config file exists
if (!fs.existsSync(configPath)) {
  console.error(`Error: Claude Desktop config file not found at ${configPath}`);
  console.error('Make sure Claude Desktop is installed and has been run at least once.');
  process.exit(1);
}

// Read the config file
let config;
try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configContent);
} catch (error) {
  console.error(`Error reading Claude Desktop config file: ${error.message}`);
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

// Update the config
if (!config.mcpServers) {
  config.mcpServers = {};
}
config.mcpServers.papertrail = papertrailConfig;

// Write the updated config back to the file
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  console.log(`Successfully updated Claude Desktop config file at ${configPath}`);
  console.log('The Papertrail MCP server has been added to your Claude Desktop configuration.');
} catch (error) {
  console.error(`Error writing Claude Desktop config file: ${error.message}`);
  process.exit(1);
}
