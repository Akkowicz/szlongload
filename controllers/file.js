const fs = require('fs');
const path = require('path');
const CronJob = require('cron').CronJob;

const getFilesForDeletion = async () => {
    const searchIn = './uploads';

    await fs.readdir(searchIn, function (err, files) {
        if (err) {
            console.error('Could not list the directory.', err);
            process.exit(1);
        }

        files.forEach(function (file, index) {
            let filePath = path.join(searchIn, file);

            fs.stat(filePath, function (error, stat) {
                if (error) {
                    console.error('Error stating file.', error);
                    return;
                }
                const now = Date.now();
                const creationDate = stat.ctime;
                const diff = new Date(now - creationDate);
                console.log('Code run');
                if (diff.getDay >= 1) {
                    fs.unlink(filePath, (err) => {
                        if (err) throw err;
                        console.log('File was deleted');
                    });
                }
            });
        });
    });
};

const createUploadsDir = async () => {
    fs.mkdir('./uploads', { recursive: true }, (err) => {
        if (err) throw err;
    });
};

createUploadsDir();
getFilesForDeletion();
exports.job = new CronJob('20 * * * *', getFilesForDeletion);