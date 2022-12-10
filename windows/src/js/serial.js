const { SerialPort } = require('serialport');
const { convertDate, convertTime, labelConvertDate } = require('./dateConvert');
const { saveData, readData, addResult, newSerialNumber } = require('./saveData');
const os = require("os");
const userHomeDir = os.homedir();
const xl = require('excel4node');
const computerName = os.hostname()
const path = require('path');

var port;
var connected = false;
var testing = false;
var comselector = document.getElementById('com-select');
var consoleView = document.getElementById('console-text');
var buffer = '';
var currentData = {
  step1:  '',
  step2:  '',
  step3:  '',
  step4:  '',
  step5:  '',
  step6:  '',
  time:   '',
  date:   '',
  serial: '',
  result: '',
}
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}
var saveExcel = () => {
  var wb = new xl.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  var style = wb.createStyle({
    font: {
      color: '#364152',
      size: 12,
    },
  });
  readData().then(data => {
    if(data == null) data = {testResults: []};
    var results = data.testResults;
    ws.cell(1, 1).string('Serial Number').style(style);
    ws.cell(1, 2).string('Date').style(style);
    ws.cell(1, 3).string('Time').style(style);
    ws.cell(1, 4).string('Status').style(style);
    ws.cell(1, 5).string('').style(style);
    ws.cell(1, 6).string('STEP1').style(style);
    ws.cell(1, 7).string('STEP2').style(style);
    ws.cell(1, 8).string('STEP3').style(style);
    ws.cell(1, 9).string('STEP4').style(style);
    ws.cell(1, 10).string('STEP5').style(style);
    ws.cell(1, 11).string('STEP6').style(style);
    ws.cell(1, 12).string('').style(style);
    ws.cell(1, 13).string('min1').style(style);
    ws.cell(1, 14).string('max1').style(style);
    ws.cell(1, 15).string('min2').style(style);
    ws.cell(1, 16).string('max2').style(style);
    ws.cell(1, 17).string('min3').style(style);
    ws.cell(1, 18).string('max3').style(style);
    ws.cell(1, 19).string('min4').style(style);
    ws.cell(1, 20).string('max4').style(style);
    ws.cell(1, 21).string('min5').style(style);
    ws.cell(1, 22).string('max5').style(style);
    ws.cell(1, 23).string('min6').style(style);
    ws.cell(1, 24).string('max6').style(style);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      ws.cell(i+2, 1).string(typeof(result.serial) != 'undefined' ? result.serial.toString() : '').style(style);
      ws.cell(i+2, 2).string(typeof(result.date) != 'undefined' ? result.date.toString() : '').style(style);
      ws.cell(i+2, 3).string(typeof(result.time) != 'undefined' ? result.time.toString() : '').style(style);
      ws.cell(i+2, 4).string(typeof(result.result) != 'undefined' ? result.result.toString() : '').style(style);
      ws.cell(i+2, 5).string(''.toString()).style(style);
      ws.cell(i+2, 6).string(typeof(result.step1) != 'undefined' ? result.step1.toString() : '').style(style);
      ws.cell(i+2, 7).string(typeof(result.step2) != 'undefined' ? result.step2.toString() : '').style(style);
      ws.cell(i+2, 8).string(typeof(result.step3) != 'undefined' ? result.step3.toString() : '').style(style);
      ws.cell(i+2, 9).string(typeof(result.step4) != 'undefined' ? result.step4.toString() : '').style(style);
      ws.cell(i+2, 10).string(typeof(result.step5) != 'undefined' ? result.step5.toString() : '').style(style);
      ws.cell(i+2, 11).string(typeof(result.step6) != 'undefined' ? result.step6.toString() : '').style(style);
      ws.cell(i+2, 12).string('').style(style);
      ws.cell(i+2, 13).string(typeof(result.min1) != 'undefined' ? result.min1.toString() : '').style(style);
      ws.cell(i+2, 14).string(typeof(result.max1) != 'undefined' ? result.max1.toString() : '').style(style);
      ws.cell(i+2, 15).string(typeof(result.min2) != 'undefined' ? result.min2.toString() : '').style(style);
      ws.cell(i+2, 16).string(typeof(result.max2) != 'undefined' ? result.max2.toString() : '').style(style);
      ws.cell(i+2, 17).string(typeof(result.min3) != 'undefined' ? result.min3.toString() : '').style(style);
      ws.cell(i+2, 18).string(typeof(result.max3) != 'undefined' ? result.max3.toString() : '').style(style);
      ws.cell(i+2, 19).string(typeof(result.min4) != 'undefined' ? result.min4.toString() : '').style(style);
      ws.cell(i+2, 20).string(typeof(result.max4) != 'undefined' ? result.max4.toString() : '').style(style);
      ws.cell(i+2, 21).string(typeof(result.min5) != 'undefined' ? result.min5.toString() : '').style(style);
      ws.cell(i+2, 22).string(typeof(result.max5) != 'undefined' ? result.max5.toString() : '').style(style);
      ws.cell(i+2, 23).string(typeof(result.min6) != 'undefined' ? result.min6.toString() : '').style(style);
      ws.cell(i+2, 24).string(typeof(result.max6) != 'undefined' ? result.max6.toString() : '').style(style);
    }
    wb.write(path.normalize('c:/Users/bitbin.ir/Desktop/Excel.xlsx'));
  }).catch(err => console.log(err));
}
var updatePortList = () =>{
  SerialPort.list().then(function(ports){
    removeAllChildNodes(comselector);
    for (let i = ports.length-1; i >= 0; i--) {
    // for (let i = 0; i < ports.length; i++) {
      const port = ports[i];
      var option = document.createElement('option');
      option.value = port.path;
      option.textContent = port.path;
      comselector.appendChild(option);
    }
  });
}
updatePortList();
//setInterval(updatePortList, 20000);
var updateDateAndTime = () => {
  document.getElementById('date-value').textContent = convertDate(new Date());
  document.getElementById('time-value').textContent = convertTime(new Date());
}
$(document).ready(() => {
  newSerialNumber().then(num => {
    document.getElementById('serial-num-value').textContent = num;
    currentData.serial = num
  }).catch(err => console.log(err));
  updateDateAndTime();
  $('#test-result-q' ).hide();
  $('#test-result-dq').hide();
  $('#step-check-1').hide();
  $('#step-check-2').hide();
  $('#step-check-3').hide();
  $('#step-check-4').hide();
  $('#step-check-5').hide();
  $('#step-check-6').hide();
  $('#step-times-1').show();
  $('#step-times-2').show();
  $('#step-times-3').show();
  $('#step-times-4').show();
  $('#step-times-5').show();
  $('#step-times-6').show();
  $('#connect-button').click(() => {
    console.log()
    port = new SerialPort({
      path: $('#com-select').val(),
      baudRate: parseInt($('#boudrate-select').val()),
      autoOpen: false,
    });
    port.open(function (err) {
      if (err) alert("Couldn't open serial port!!");
      else{
        $('#starttest-button').removeClass('disabled');
        connected = true;
        consoleView.textContent += 'Connected To Device.\n';
        consoleView.scrollTo(0, consoleView.scrollHeight);
        $('#test-result-q' ).hide();
        $('#test-result-dq').hide();
        $('#step-check-1').hide();
        $('#step-check-2').hide();
        $('#step-check-3').hide();
        $('#step-check-4').hide();
        $('#step-check-5').hide();
        $('#step-check-6').hide();
        $('#step-times-1').show();
        $('#step-times-2').show();
        $('#step-times-3').show();
        $('#step-times-4').show();
        $('#step-times-5').show();
        $('#step-times-6').show();
        $('#progress-handle').css('width', '0');
        document.getElementById('step-value-1').textContent = '-';
        document.getElementById('step-value-2').textContent = '-';
        document.getElementById('step-value-3').textContent = '-';
        document.getElementById('step-value-4').textContent = '-';
        document.getElementById('step-value-5').textContent = '-';
        document.getElementById('step-value-6').textContent = '-';
        $('#connect-button').addClass('hidden');
        $('#disconnect-button').removeClass('hidden');
        port.on('readable', function () {
          var data = port.read().toString();
          buffer += data;
          consoleView.textContent += data;
          consoleView.scrollTo(0, consoleView.scrollHeight);
          if(buffer.indexOf('\n') != -1){
            updateDateAndTime();
            console.log(buffer)
            if(buffer.substr(0,4) == "MIN1"){
              document.getElementById('min-value-1').textContent = buffer.substr(12, 4);
              currentData.min1 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MIN2"){
              document.getElementById('min-value-2').textContent = buffer.substr(12, 4);
              currentData.min2 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MIN3"){
              document.getElementById('min-value-3').textContent = buffer.substr(12, 4);
              currentData.min3 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MIN4"){
              document.getElementById('min-value-4').textContent = buffer.substr(12, 4);
              currentData.min4 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MIN5"){
              document.getElementById('min-value-5').textContent = buffer.substr(12, 4);
              currentData.min5 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MIN6"){
              document.getElementById('min-value-6').textContent = buffer.substr(12, 4);
              currentData.min6 = buffer.substr(12, 4);
            }
            
            if(buffer.substr(0,4) == "MAX1"){
              document.getElementById('max-value-1').textContent = buffer.substr(12, 4);
              currentData.max1 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MAX2"){
              document.getElementById('max-value-2').textContent = buffer.substr(12, 4);
              currentData.max2 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MAX3"){
              document.getElementById('max-value-3').textContent = buffer.substr(12, 4);
              currentData.max3 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MAX4"){
              document.getElementById('max-value-4').textContent = buffer.substr(12, 4);
              currentData.max4 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MAX5"){
              document.getElementById('max-value-5').textContent = buffer.substr(12, 4);
              currentData.max5 = buffer.substr(12, 4);
            }
            if(buffer.substr(0,4) == "MAX6"){
              document.getElementById('max-value-6').textContent = buffer.substr(12, 4);
              currentData.max6 = buffer.substr(12, 4);
            }
            

            if(buffer.substr(0,5) == "STEP1"){
              document.getElementById('step-value-1').textContent = buffer.substr(14, 3);
              currentData.step1 = buffer.substr(14, 3);
              $('#step-times-1').hide();
              $('#step-check-1').show();
              $('#progress-handle').css('width', '10%');
            }
            if(buffer.substr(0,5) == "STEP2"){
              document.getElementById('step-value-2').textContent = buffer.substr(14, 3);
              currentData.step2 = buffer.substr(14, 3);
              $('#step-times-2').hide();
              $('#step-check-2').show();
              $('#progress-handle').css('width', '25%');
            }
            if(buffer.substr(0,5) == "STEP3"){
              document.getElementById('step-value-3').textContent = buffer.substr(14, 3);
              currentData.step3 = buffer.substr(14, 3);
              $('#step-times-3').hide();
              $('#step-check-3').show();
              $('#progress-handle').css('width', '40%');
            }
            if(buffer.substr(0,5) == "STEP4"){
              document.getElementById('step-value-4').textContent = buffer.substr(14, 4);
              currentData.step4 = buffer.substr(14, 4);
              $('#step-times-4').hide();
              $('#step-check-4').show();
              $('#progress-handle').css('width', '55%');
            }
            if(buffer.substr(0, 10) == "DOWN STEP3"){
              document.getElementById('step-value-5').textContent = buffer.substr(20, 4);
              currentData.step5 = buffer.substr(20, 4);
              $('#step-times-5').hide();
              $('#step-check-5').show();
              $('#progress-handle').css('width', '70%');
            }
            if(buffer.substr(0, 10) == "DOWN STEP2"){
              document.getElementById('step-value-6').textContent = buffer.substr(20, 4);
              currentData.step6 = buffer.substr(20, 4);
              $('#step-times-6').hide();
              $('#step-check-6').show();
              $('#progress-handle').css('width', '85%');
            }
            if(buffer.indexOf("REPORT") > -1){
              var reportIndex = buffer.indexOf("REPORT");
              if(buffer.substr(reportIndex + 7, 2) == 'NG'){
                currentData.result = 'NG';
                $('#test-result-q' ).hide();
                $('#test-result-dq').show();
              }
              else if(buffer.substr(reportIndex + 7, 2) == 'GD'){
                currentData.result = 'GD';
                $('#test-result-dq').hide();
                $('#test-result-q' ).show();
              }
              $('#step-times-6').hide();
              $('#step-check-6').show();
              $('#progress-handle').css('width', '100%');
              currentData.date = convertDate(new Date());
              currentData.time = convertTime(new Date());
              testing = false;
              $('#starttest-button').removeClass('disabled');
            }
            buffer = '';
          }
          // if(data == 'device' || data == 'DEVICE'){
          //   if(!connected){
          //     port.write('ready\n')
          //     $('#starttest-button').removeClass('disabled');
          //     connected = true;
          //   }
          // }
        })
        // setTimeout(() => {
        //   if(!connected){
        //     port.close();
        //     connected = false;
        //     $('#connect-button').removeClass('hidden');
        //     $('#disconnect-button').addClass('hidden');
        //     $('#starttest-button').addClass('disabled');
        //     alert("Serial port opened but no Device found!!");
        //   }
        // }, 3000);
      }
    })
  });
  $('#disconnect-button').click(() => {
    port.close();
    connected = false;
    $('#connect-button').removeClass('hidden');
    $('#disconnect-button').addClass('hidden');
    $('#starttest-button').addClass('disabled');
    consoleView.textContent += 'Disconnected Successfuly.\n';
    consoleView.scrollTo(0, consoleView.scrollHeight);
  });
  $('#starttest-button').click(() => {
    if(!testing){
      port.write('start\n');
      testing = true;
      $('#starttest-button').addClass('disabled');
      consoleView.textContent += 'Sending Request To Device...\n';
      consoleView.scrollTo(0, consoleView.scrollHeight);
    }
  });
  $('#save-button').click(() => {
    currentData.serial = document.getElementById('serial-num-value').textContent;
    currentData.step1 = document.getElementById('step-value-1').textContent;
    currentData.step2 = document.getElementById('step-value-2').textContent;
    currentData.step3 = document.getElementById('step-value-3').textContent;
    currentData.step4 = document.getElementById('step-value-4').textContent;
    currentData.step5 = document.getElementById('step-value-5').textContent;
    currentData.step6 = document.getElementById('step-value-6').textContent;
    currentData.components = [
      document.getElementById('component-input1').value,
      document.getElementById('component-input2').value,
      document.getElementById('component-input3').value,
      document.getElementById('component-input4').value,
      document.getElementById('component-input5').value,
      document.getElementById('component-input6').value,
      document.getElementById('component-input7').value,
      document.getElementById('component-input8').value,
      document.getElementById('component-input9').value,
      document.getElementById('component-input10').value,
      document.getElementById('component-input11').value,
      document.getElementById('component-input12').value,
      document.getElementById('component-input13').value,
    ];
    currentData.date = convertDate(new Date());
    currentData.time = convertTime(new Date());
    addResult(currentData);
    alert('Data saved successfuly!!')
  });
  $('#new-button').click(() => {
    newSerialNumber().then(num => {
      console.log(num)
      document.getElementById('serial-num-value').textContent = num;
      currentData.serial = num
    }).catch(err => console.log(err));
    $('#test-result-q' ).hide();
    $('#test-result-dq').hide();
    $('#step-check-1').hide();
    $('#step-check-2').hide();
    $('#step-check-3').hide();
    $('#step-check-4').hide();
    $('#step-check-5').hide();
    $('#step-check-6').hide();
    $('#step-times-1').show();
    $('#step-times-2').show();
    $('#step-times-3').show();
    $('#step-times-4').show();
    $('#step-times-5').show();
    $('#step-times-6').show();
    document.getElementById('step-value-1').textContent = '-';
    document.getElementById('step-value-2').textContent = '-';
    document.getElementById('step-value-3').textContent = '-';
    document.getElementById('step-value-4').textContent = '-';
    document.getElementById('step-value-5').textContent = '-';
    document.getElementById('step-value-6').textContent = '-';
    $('#progress-handle').css('width', '0');
    var currentData = {
      step1:  '',
      step2:  '',
      step3:  '',
      step4:  '',
      step5:  '',
      step6:  '',
      time:   '',
      date:   '',
      serial: '',
      result: '',
    }
  })
  $('#print-labels-button').click(() => {
    var now = labelConvertDate(new Date());
    document.getElementById('print-serial-num-1').textContent = document.getElementById('label-serialnum-1').textContent + '-' + now;
    document.getElementById('print-serial-num-2').textContent = document.getElementById('label-serialnum-2').textContent + '-' + now;
    document.getElementById('print-serial-num-3').textContent = document.getElementById('label-serialnum-3').textContent + '-' + now;
    document.getElementById('print-serial-num-4').textContent = document.getElementById('label-serialnum-4').textContent + '-' + now;
    document.getElementById('main-container').classList.add('hidden');
    document.getElementById('file-print-frame').classList.remove('hidden');
    var beforePrint = function () {};
    var afterPrint = function () {
        document.getElementById('main-container').classList.remove('hidden');
        document.getElementById('file-print-frame').classList.add('hidden');
    };
    if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
            //alert($(mediaQueryList).html());
            if (mql.matches) {
                beforePrint();
            } else {
                afterPrint();
            }
        });
    }
    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
    setTimeout(() => {
        window.print();
    }, 1000);
  })
  $('#view-database-button').click(() => {
    $('.black-modal').show(); 
    $('#database-view').show();
  })
  $('.black-modal').click(() => {
    $('.black-modal').hide(); 
    $('#database-view').hide();
  })
  $('#excel-button').click(() => {
    saveExcel();
  });
  $('#label-view-1').mouseenter(() => {
    var text = document.getElementById('label-serialnum-1').textContent;
    if(text == '')    $('#label-plus-1').show();
    else              $('#label-times-1').show();
  });
  $('#label-view-1').mouseleave(() => {
    $('#label-plus-1').hide();
    $('#label-times-1').hide();
  });
  $('#label-view-2').mouseenter(() => {
    var text = document.getElementById('label-serialnum-2').textContent;
    if(text == '')    $('#label-plus-2').show();
    else              $('#label-times-2').show();
  });
  $('#label-view-2').mouseleave(() => {
    $('#label-plus-2').hide();
    $('#label-times-2').hide();
  });
  $('#label-view-3').mouseenter(() => {
    var text = document.getElementById('label-serialnum-3').textContent;
    if(text == '')    $('#label-plus-3').show();
    else              $('#label-times-3').show();
  });
  $('#label-view-3').mouseleave(() => {
    $('#label-plus-3').hide();
    $('#label-times-3').hide();
  });
  $('#label-view-4').mouseenter(() => {
    var text = document.getElementById('label-serialnum-4').textContent;
    if(text == '')    $('#label-plus-4').show();
    else              $('#label-times-4').show();
  });
  $('#label-view-4').mouseleave(() => {
    $('#label-plus-4').hide();
    $('#label-times-4').hide();
  });
  
  $('#label-plus-1').click(() => {
    document.getElementById('label-serialnum-1').textContent = document.getElementById('serial-num-value').textContent;
    $('#label-times-1').show();
    $('#label-plus-1').hide();
  });
  $('#label-plus-2').click(() => {
    document.getElementById('label-serialnum-2').textContent = document.getElementById('serial-num-value').textContent;
    $('#label-times-2').show();
    $('#label-plus-2').hide();
  });
  $('#label-plus-3').click(() => {
    document.getElementById('label-serialnum-3').textContent = document.getElementById('serial-num-value').textContent;
    $('#label-times-3').show();
    $('#label-plus-3').hide();
  });
  $('#label-plus-4').click(() => {
    document.getElementById('label-serialnum-4').textContent = document.getElementById('serial-num-value').textContent;
    $('#label-times-4').show();
    $('#label-plus-4').hide();
  });

  $('#label-times-1').click(() => {
    document.getElementById('label-serialnum-1').textContent = '';
    $('#label-times-1').hide();
    $('#label-plus-1').show();
  });
  $('#label-times-2').click(() => {
    document.getElementById('label-serialnum-2').textContent = '';
    $('#label-times-2').hide();
    $('#label-plus-2').show();
  });
  $('#label-times-3').click(() => {
    document.getElementById('label-serialnum-3').textContent = '';
    $('#label-times-3').hide();
    $('#label-plus-3').show();
  });
  $('#label-times-4').click(() => {
    document.getElementById('label-serialnum-4').textContent = '';
    $('#label-times-4').hide();
    $('#label-plus-4').show();
  });
});