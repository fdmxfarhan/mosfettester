var fs = require('fs').promises;
var path = require('path');
var pathName = path.join(__dirname, '../files');

var saveData = (data) => {
    var file = path.join(pathName, 'database.json');
    fs.writeFile(file, JSON.stringify(data), (err) => {
        if(err) console.log(err);
    })
}

var readData = async () => {
    try {
        const data = await fs.readFile(path.join(pathName, 'database.json'));
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

var addResult = (newData) => {
    readData().then(data => {
        // console.log(data);
        if(data == null) data = {testResults: []};
        data.testResults.push(newData);
        saveData(data);
    }).catch(err => console.log(err));
}

var newSerialNumber = async () => {
    try {
        var data = await fs.readFile(path.join(pathName, 'database.json'));
        data = JSON.parse(data);
        if(data == null) data = {testResults: []};
        var serialNumber = 1000000000
        for (let i = 0; i < data.testResults.length; i++) {
            const result = data.testResults[i];
            if(parseInt(result.serial) > serialNumber)
                serialNumber = parseInt(result.serial);
        }
        return serialNumber+1;
    } catch (error) {
        return 1000000001;
    }
}

module.exports = {
    saveData,
    readData, 
    addResult,
    newSerialNumber,
};
