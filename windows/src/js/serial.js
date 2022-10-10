const { SerialPort } = require('serialport');
const { convertDate, convertTime } = require('./dateConvert');
const { saveData, readData, addResult, newSerialNumber } = require('./saveData');
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
// port.write('main screen turn on', function(err) {
//   if (err) {
//     return console.log('Error on write: ', err.message)
//   }
//   console.log('message written')
// })
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
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
setInterval(updatePortList, 5000);
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
            if(buffer.substr(0, 6) == "REPORT"){
              if(buffer.substr(7, 2) == 'NG'){
                currentData.result = 'NG';
                $('#test-result-q' ).hide();
                $('#test-result-dq').show();
              }
              else if(buffer.substr(7, 2) == 'GD'){
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
    addResult(currentData);
    alert('Data saved successfuly!!')
  });
  $('#new-button').click(() => {
    newSerialNumber().then(num => {
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
  $('#print-button').click(() => {
    document.getElementById('print-serial-num').textContent = currentData.serial;
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
});