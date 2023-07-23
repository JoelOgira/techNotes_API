const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const logEvents = async (message, logNameFile) => {
    const datetime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss');
    const logItem = `${datetime}\t${uuid()}\t${message}\n`;
    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logNameFile), logItem);
    } catch (err) {
        console.log(`Error: ${err}`);
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method} ${req.path}`);
    next();
}

module.exports = { logEvents, logger };