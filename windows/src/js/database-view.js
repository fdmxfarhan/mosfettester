const { SerialPort } = require('serialport');
const { convertDate, convertTime, labelConvertDate } = require('./dateConvert');
const { saveData, readData, addResult, newSerialNumber } = require('./saveData');
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
var updateDatabase = () => {
    readData().then(data => {
        if(data == null) data = {testResults: []};
        var results = data.testResults;
        removeAllChildNodes(document.getElementById('database-table'));
        
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            var tr = document.createElement('tr');
            var td1  = document.createElement('td');
            var td2  = document.createElement('td');
            var td3  = document.createElement('td');
            var td4  = document.createElement('td');
            var td5  = document.createElement('td');
            var td6  = document.createElement('td');
            var td7  = document.createElement('td');
            var td8  = document.createElement('td');
            var td9  = document.createElement('td');
            var td10 = document.createElement('td');
            var td11 = document.createElement('td');
            td1.textContent  = result.serial;
            td2.textContent  = result.step1;
            td3.textContent  = result.step2;
            td4.textContent  = result.step3;
            td5.textContent  = result.step4;
            td6.textContent  = result.step5;
            td7.textContent  = result.step6;
            td8.textContent  = result.time;
            td9.textContent  = result.date;
            td10.textContent = result.result;
            td11.textContent = result.components;
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            tr.appendChild(td6);
            tr.appendChild(td7);
            tr.appendChild(td8);
            tr.appendChild(td9);
            tr.appendChild(td10);
            tr.appendChild(td11);
            document.getElementById('database-table').appendChild(tr);
        }
    
    
    }).catch(err => console.log(err));
}
updateDatabase();
$(document).ready(() => {
  $('#view-database-button').click(() => {
    updateDatabase();
  });
});