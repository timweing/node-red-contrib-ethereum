# node-red-contrib-ethereum
A node palette for interacting with ethereum clients

## Node Documentation
The documentation of the nodes can be read directly in the node-RED editor by opening the 'help' section. 

## Installation
#### Prerequisites
- Install Node.js : https://nodejs.org/en/download/package-manager/
- Install Node-RED : https://nodered.org/docs/getting-started/local

#### Installing the node palette
- Currently this package is not available from the Node-RED Library. 
It must be installed using the npm package manager (comes with Node.js).

- First copy this package (node-red-contrib-ethereum) to anywhere on your machine.

- Then find the .node-red directory (usually located inside the user directory)

- From the .node-red directory run the following command to install the packge to Node-RED.
```bash
npm install <path to node-red-contrib-ethereum>
```

- Run Node-RED
```bash
node-red
```

- The console logs will show a log entry like this, where you can find the url to access the Node-RED editor from your web browser.
```bash
6 Jan 10:13:34 - [info] Server now running at http://127.0.0.1:1880/
```

- If everything worked out, you will find the ethereum nodes in the node palette.

## Example flows
#### Prerequisites
- Install Truffle : https://www.trufflesuite.com/truffle
- Install Ganache : https://www.trufflesuite.com/ganache

#### Set up ganache workspace
- Start ganache and choose 'New Workspace' 
- In the setup window, go to the 'Accounts & Keys' tab
- Enter the following mnemonic and then press 'Save Workspace'
```bash
visit carpet logic blame furnace confirm rebel deliver medal mean illness error
```

#### Deploy test smart contracts
- Find the smart contracts directory 'node-red-contrib-ethereum\example-flows\example-contracts'
- From the smart contracts directory run the commands to deploy the contracts to ganache
```bash
truffle compile
truffle migrate
```
- In ganache go to the 'Contracts' tab and choose 'Link Truffle Projects'
- Choose 'Add Project' and select the truffle-config.js from the smart contracts directory
- Press 'Save and Restart'
- Now you should see the deployed contracts in the 'Contracts' tab

#### Install the VISEO Nodes
- In Node-RED editor go to the 'Manage palette' menu 
- Install the package: node-red-contrib-viseo-ethjs

### Install other packages
- Install: node-red-contrib-binary
- Install: node-red-contrib-https

#### Import flows
- Find the file 'node-red-contrib-ethereum\example-flows\ExampleFlows.json'
- In Node-RED editor go to the 'Import' menu 
- Copy & Paste the contents of ExampleFlows.json into the text field and press 'Import'

#### Enter Account Private Keys
- The private keys of the accounts where not part of the import, they must be entered manually
- In Node-RED editor find the 'Configuration Nodes' menu
- Enter the private keys for the following account config nodes:
- sender-account 'Account 11' : 0xfc72302ffbed8453080f1149135cfb57155d90c8e3cfa8835871d954cea50664
- ethjs-wallet 'Account 11' : 0xfc72302ffbed8453080f1149135cfb57155d90c8e3cfa8835871d954cea50664
- ethjs-wallet 'Account 2' : 0xdbbf87459bea5ca7309d9eb990f05922ab8579f4ad42364ffc229000db2ed818
- ethjs-wallet 'Account 3' : 0xde4ed0ee59a7153b7c32e5d6e25ecbfd42e94f0130be604d231169d2e67cd7f5
- Hit the 'Deploy' button
- Now the flows should be usable, try them out




