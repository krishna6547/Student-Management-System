const multer = require('multer');

function getRandom8DigitString() {
    const number = Math.floor(10000000 + Math.random() * 90000000);
    return number.toString();
}

const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            const filename = `${Date.now()}-${getRandom8DigitString()}-${file.originalname}`;
            cb(null, filename);
        }
    }
);
const upload = multer({
    storage: storage
});
module.exports = upload;
