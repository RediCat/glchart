const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

let mainWindow;

app.commandLine.appendSwitch('remote-debugging-port', '9222');

function createWindow () {
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: false,
			webSecurity: false
		}
	});

	let rootUrl = url.format({
		pathname: '/tools/sandbox/index.html',
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(rootUrl);

	mainWindow.on('closed', () => mainWindow = null);
}

function setupFileProtocol () {
	let protoRegistrationSuccess = (request, callback) => {
		// remove the 'file://' uri scheme component
		let url = request.url.substr(7);
		url = path.normalize(`${__dirname}/../../${url}`);

		console.log(url);
		callback({path: url});
	};

	electron.protocol.interceptFileProtocol('file', protoRegistrationSuccess);
}

app.on('ready', () => {
	setupFileProtocol();
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});
