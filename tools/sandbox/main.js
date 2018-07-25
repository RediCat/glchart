const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
	let windowOpts = {
		webPreferences: {
			nodeIntegration: true
		}
	};
	mainWindow = new BrowserWindow(windowOpts);
	mainWindow.setMenu(null);

	let rootUrl = url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(rootUrl);

	mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

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
