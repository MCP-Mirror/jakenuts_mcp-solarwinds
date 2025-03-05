try {
  const fs = require('fs');
  const path = require('path');
  
  console.log('Checking for MCP SDK...');
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('node_modules directory not found. Please run npm install first.');
    process.exit(1);
  }
  
  // Check if MCP SDK exists
  const mcpSdkPath = path.join(nodeModulesPath, '@modelcontextprotocol', 'sdk');
  if (!fs.existsSync(mcpSdkPath)) {
    console.log('@modelcontextprotocol/sdk not found. Please run npm install first.');
    process.exit(1);
  }
  
  console.log('MCP SDK found at:', mcpSdkPath);
  
  // Check if types.js exists
  const typesPath = path.join(mcpSdkPath, 'types.js');
  if (!fs.existsSync(typesPath)) {
    console.log('types.js not found in MCP SDK.');
    
    // List files in the SDK directory
    console.log('Files in MCP SDK directory:');
    const files = fs.readdirSync(mcpSdkPath);
    files.forEach(file => {
      console.log('  -', file);
    });
  } else {
    console.log('types.js found at:', typesPath);
  }
  
  // Check if server/index.js exists
  const serverIndexPath = path.join(mcpSdkPath, 'server', 'index.js');
  if (!fs.existsSync(serverIndexPath)) {
    console.log('server/index.js not found in MCP SDK.');
    
    // Check if server directory exists
    const serverPath = path.join(mcpSdkPath, 'server');
    if (fs.existsSync(serverPath)) {
      console.log('Files in server directory:');
      const files = fs.readdirSync(serverPath);
      files.forEach(file => {
        console.log('  -', file);
      });
    } else {
      console.log('server directory not found in MCP SDK.');
    }
  } else {
    console.log('server/index.js found at:', serverIndexPath);
  }
  
  console.log('Check complete.');
} catch (error) {
  console.error('Error checking MCP SDK:', error);
  process.exit(1);
}
