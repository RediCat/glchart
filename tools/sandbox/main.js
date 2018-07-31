const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow()
{
	mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

	let rootUrl = url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(rootUrl);

	mainWindow.on('closed', () => mainWindow = null);
}

function setupFileProtocol()
{
	let protoRegistrationSuccess = (request, callback) => {
        // remove the 'file://' uri scheme component
        const url = request.url.substr(7);
        callback({path: path.normalize(`${__dirname}/${url}`)});
    };

	let protoRegistrationError = (err) => {
		console.error(`file protocol registration failed: ${err}.`);
	};

	electron.protocol.interceptFileProtocol('file', protoRegistrationSuccess, protoRegistrationError);
}

app.on('ready', () => {
	//setupFileProtocol();
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
