// experimental code for Concox BL10 lock socket server
//
// parse code borrowed from https://gitlab.com/elyez/concox

const net = require('net');
const util = require('./util')
const crc16 = require('crc16-itu')

var locks = [];

// let data = '7979004a3213090f1721070cc40595cad8008cb07801148d0900cc0400de00fa4c232400de00fa4a1a00de00e5fd1400de00313a1100de0002830c00de0002820900de006ea205000c00003cee700d0a'
// let gps = {
//     protocol  : data.substr(8,2),
//     gpstime   : util.toTime(data.substr(10,2), data.substr(12,2), data.substr(14,2), data.substr(16,2), data.substr(18,2), data.substr(20,2), 'hex'),
//     infolength: util.hex2int(data.substr(22,2)),
//     satellite : util.hex2int(data.substr(24,2)),
//     latitude  : parseFloat(util.hex2int(data.substr(26,8)) / 1800000),
//     longitude : parseFloat(util.hex2int(data.substr(34,8)) / 1800000),
//     altitude  : 0,
//     speed     : util.hex2int(data.substr(42,2)),
//     heading   : 0,
//     mileage   : 0,
//     event     : 0,
//     input     : '00000000',
//     output    : '00000000',
//     location  : '',
//     received  : new Date().toISOString(),
//     others    : {}
// };
//
// let binary = util.hex2bin(data.substr(44,2)) + util.hex2bin(data.substr(45,2));
//
// if (parseInt(binary.substr(4,1)) == 1) gps.longitude *= -1;
// if (parseInt(binary.substr(5,1)) == 0) gps.latitude *= -1;
//
// gps.heading = parseInt( binary.substr(6,10), 2);
//
// gps.others.gsm = {
//     mcc: parseInt("0x"+data.substr(50,4)),
//     mnc: parseInt("0x"+data.substr(54,2)),
//     lac: parseInt("0x"+data.substr(56,4)),
//     cid: parseInt("0x"+data.substr(60,6))
// }
//
// // const statusInfo = socket.statusInfo;
// // if (statusInfo) {
// //   gps.input = statusInfo.input;
// //   gps.others.signal = statusInfo.signal;
// //   gps.others.batt = statusInfo.batt;
// // }
//
// if (data.length > 75) {
//   const statusInfo = util.hex2bin(data.substr(62,2));
//   gps.input = '0' + statusInfo.substr(5,1) + statusInfo.substr(6,1) + '0';
//
//   if (statusInfo.substr(2,3) === '100') gps.event = -65;
//   else if (statusInfo.substr(2,3) === '011') gps.event =  17;
//   else if (statusInfo.substr(2,3) === '010')  gps.event = -23;
//   else if (statusInfo.substr(2,3) === '001')  gps.event =  30;
//
//   const voltage = util.hex2int(data.substr(64,2));
//   gps.others.batt = parseInt(voltage * 100/6) + '%';
//   gps.others.signal = 3 * util.hex2int("0"+data.substr(67,1));
//
//   const alarm = util.hex2int(data.substr(68,2));
//
//   if (alarm === 0) {}
//   else if (alarm === 1) gps.event = 65;
//   else if (alarm === 2)  gps.event = 23;
//   else if (alarm === 3)  gps.event =  30;
//   else if (alarm === 14) gps.event =  17;
//   else if (alarm === 20) gps.event = 102;
// }
//
// console.log("%o", gps)

var locks = {};

const parse = (socket, data, callback) => {
  let gps = {
    protocol  : data.substr(8,2),
    gpstime   : util.toTime(data.substr(10,2), data.substr(12,2), data.substr(14,2), data.substr(16,2), data.substr(18,2), data.substr(20,2), 'hex'),
    infolength: util.hex2int(data.substr(22,2)),
    satellite : util.hex2int(data.substr(24,2)),
    latitude  : parseFloat(util.hex2int(data.substr(26,8)) / 1800000),
    longitude : parseFloat(util.hex2int(data.substr(34,8)) / 1800000),
    altitude  : 0,
    speed     : util.hex2int(data.substr(42,2)),
    heading   : 0,
    mileage   : 0,
    event     : 0,
    input     : '00000000',
    output    : '00000000',
    location  : '',
    received  : new Date().toISOString(),
    others    : {}
  };

  let binary = util.hex2bin(data.substr(40,2)) + util.hex2bin(data.substr(42,2));

  if (parseInt(binary.substr(4,1)) == 1) gps.longitude *= -1;
  if (parseInt(binary.substr(5,1)) == 0) gps.latitude *= -1;

  gps.heading = parseInt( binary.substr(6,10), 2);

  gps.others.gsm = {
      mcc: parseInt("0x"+data.substr(44,4)),
      mnc: parseInt("0x"+data.substr(48,2)),
      lac: parseInt("0x"+data.substr(50,4)),
      cid: parseInt("0x"+data.substr(54,6))
  }

  const statusInfo = socket.statusInfo;
  if (statusInfo) {
    gps.input = statusInfo.input;
    gps.others.signal = statusInfo.signal;
    gps.others.batt = statusInfo.batt;
  }

  if (data.length > 75) {
    const statusInfo = util.hex2bin(data.substr(62,2));
    gps.input = '0' + statusInfo.substr(5,1) + statusInfo.substr(6,1) + '0';

    if (statusInfo.substr(2,3) === '100') gps.event = -65;
    else if (statusInfo.substr(2,3) === '011') gps.event =  17;
    else if (statusInfo.substr(2,3) === '010')  gps.event = -23;
    else if (statusInfo.substr(2,3) === '001')  gps.event =  30;

    const voltage = util.hex2int(data.substr(64,2));
    gps.others.batt = parseInt(voltage * 100/6) + '%';
    gps.others.signal = 3 * util.hex2int("0"+data.substr(67,1));

    const alarm = util.hex2int(data.substr(68,2));

    if (alarm === 0) {}
    else if (alarm === 1) gps.event = 65;
    else if (alarm === 2)  gps.event = 23;
    else if (alarm === 3)  gps.event =  30;
    else if (alarm === 14) gps.event =  17;
    else if (alarm === 20) gps.event = 102;
  }

  return gps;
}

const update = (socket, data) => {
  const statusInfo = util.hex2bin( data.substr(8,2) );
  const voltage = util.hex2int(data.substr(10,2));

  const current = {
    input: '0' + statusInfo.substr(5,2) + '00000',
    ignition: (statusInfo.substr(6,1) || '0') == '1',
    batt: parseInt(voltage * 100/6) + '%',
    signal: 3 * util.hex2int("0"+data.substr(13,1))
  }

  socket.statusInfo = current;
}

// sendCommand()
//
// For documentation, see:
// 'BL10 GPS tracker communication protocolV1.0.8  20180408.pdf'
const sendCommand = (command) => {
  let messageCount = 1;

  const startBit = new Buffer([0x78, 0x78]);
  const protocolNumber = new Buffer([0x80]);
  // Information on content
  const commandContent = Buffer.from(command, 'ascii');
  const serverFlagBit = new Buffer([0x00, 0x00, 0x00, 0x00]);
  const lengthOfCommand = new Buffer([serverFlagBit.length + commandContent.length]);// serverFlagBit + command content length
  const language = new Buffer([0x02]);// English
  //
  const informationSerialNumber = new Buffer([0x00, messageCount]);

  const lengthOfDataBit = new Buffer([
    protocolNumber.length
    + Buffer.concat([
      new Buffer([lengthOfCommand.length]),
      serverFlagBit,
      commandContent,
      // language
    ]).length
    + informationSerialNumber.length
    + 2// errorCheck = 2 bytes
  ])

  const hexstring = crc16(
    new Buffer.concat([
      lengthOfDataBit,
      protocolNumber,
      lengthOfCommand,
      serverFlagBit,
      commandContent,
      // language,
      informationSerialNumber
    ])
  ).toString(16);

  const errorCheck = new Buffer(hexstring, 'hex');
  const stopBit = new Buffer([0x0D, 0x0A]);

  return new Buffer.concat([
    startBit,
    lengthOfDataBit,
    protocolNumber,
    lengthOfCommand,
    serverFlagBit,
    commandContent,
    // language,
    informationSerialNumber,
    errorCheck,
    stopBit
  ])

}

const processInfoContent = (cmd, infocontent, serialNo, socket) => {
  console.log("==== processing %s/%s", cmd, infocontent)
  let response = '';
    
  switch(cmd) {
    case '01':  // login packet
      let cmdinfo = {
        imei: infocontent.substr(0,8*2),
        modelcode: infocontent.substr(8*2,2*2),
        timezone: infocontent.substr(10*2,2*2),
      }
      
      // TODO: decode timezone info
      
      socket.name = cmdinfo.imei;
      
      console.log("login from %s (model: %s / tz: %s)", cmdinfo.imei, cmdinfo.modelcode, cmdinfo.timezone);
      break;
    case '21': // online command response
      let info = {
        length: infocontent.substr(0*2,4*2),
        flagbit: infocontent.substr(4*2,1*2),
        content: infocontent.substr(5*2),
      }
      console.log("command response from %s (length: %s / flagbit: %s)", socket.name, info.totallength, info.flagbit);
      
      break;
    case '23': // heartbeat package
      let terminalinfo = util.hex2bin(infocontent.substr(0,1*2));
      let language = infocontent.substr(4*2,2*2);
      // TODO: decode language bits
      // console.log('language %s', language)

      let gsmstrength = 'unknown';
      switch(infocontent.substr(3*2,1*2)) {
        case '00': gsmstrength = 'no signal'; break;
        case '01': gsmstrength = 'extremely weak'; break;
        case '02': gsmstrength = 'very weak'; break;
        case '03': gsmstrength = 'good'; break;
        case '04': gsmstrength = 'strong'; break;
      }
      
      let hbtinfo = {
        locked: terminalinfo.substr(7,1)=='1',
        charging: terminalinfo.substr(5,1)=='1',
        gpspositioning: terminalinfo.substr(1,1)=='1',
        voltage: util.hex2int(infocontent.substr(1*2,2*2))/100,
        gsmstrength: gsmstrength
      }
  
      console.log("heartbeat from %s (locked: %s / charging: %s / gpspositioning: %s / voltage: %s / gsm signal: %s)", socket.name, hbtinfo.locked, hbtinfo.charging, hbtinfo.gpspositioning, hbtinfo.voltage, hbtinfo.gsmstrength);
      break;
    default:
      console.log("unhandled command %s from %s (%s)", cmd, socket.name, infocontent)
      break;
    case 98:
      let itpinfo = {
        modulenumber1: infocontent.substr(0,1*2),
        modulelength: util.hex2int(infocontent.substr(1*2,2*2))
      }
      
      console.log('information transmission %o', itpinfo);
      break;
  }
  //   case '80': // location package
  //
  //     let locationinfo = {
  //         gpstime   : util.toTime(buf.substr(10,2), buf.substr(12,2), buf.substr(14,2), buf.substr(16,2), buf.substr(18,2), buf.substr(20,2), 'hex'),
  //         satellite : util.hex2int(buf.substr(22,1)),
  //         longitude : parseFloat(util.hex2int(buf.substr(31,8)) / 1800000),
  //         latitude  : parseFloat(util.hex2int(buf.substr(23,8)) / 1800000),
  //         altitude  : 0,
  //         speed     : util.hex2int(buf.substr(39,2)),
  //         heading   : 0,
  //         mileage   : 0,
  //         event     : 0,
  //         input     : '00000000',
  //         output    : '00000000',
  //         location  : '',
  //         received  : new Date().toISOString(),
  //         others    : {}
  //     };
  //
  //     // let binary = util.hex2bin(buf.substr(40,2)) + util.hex2bin(buf.substr(42,2));
  //     //
  //     // if (parseInt(binary.substr(4,1)) == 1) gps.longitude *= -1;
  //     // if (parseInt(binary.substr(5,1)) == 0) gps.latitude *= -1;
  //     //
  //     // gps.heading = parseInt( binary.substr(6,10), 2);
  //     //
  //     // gps.others.gsm = {
  //     //     mcc: parseInt("0x"+buf.substr(44,4)),
  //     //     mnc: parseInt("0x"+buf.substr(48,2)),
  //     //     lac: parseInt("0x"+buf.substr(50,4)),
  //     //     cid: parseInt("0x"+buf.substr(54,6))
  //     // }
  //     //
  //     // const statusInfo = socket.statusInfo;
  //     // if (statusInfo) {
  //     //   gps.input = statusInfo.input;
  //     //   gps.others.signal = statusInfo.signal;
  //     //   gps.others.batt = statusInfo.batt;
  //     // }
  //     //
  //     // if (buf.length > 75) {
  //     //   const statusInfo = util.hex2bin(buf.substr(62,2));
  //     //   gps.input = '0' + statusInfo.substr(5,1) + statusInfo.substr(6,1) + '0';
  //     //
  //     //   if (statusInfo.substr(2,3) === '100') gps.event = -65;
  //     //   else if (statusInfo.substr(2,3) === '011') gps.event =  17;
  //     //   else if (statusInfo.substr(2,3) === '010')  gps.event = -23;
  //     //   else if (statusInfo.substr(2,3) === '001')  gps.event =  30;
  //     //
  //     //   const voltage = util.hex2int(buf.substr(64,2));
  //     //   gps.others.batt = parseInt(voltage * 100/6) + '%';
  //     //   gps.others.signal = 3 * util.hex2int("0"+buf.substr(67,1));
  //     //
  //     //   const alarm = util.hex2int(buf.substr(68,2));
  //     //
  //     //   if (alarm === 0) {}
  //     //   else if (alarm === 1) gps.event = 65;
  //     //   else if (alarm === 2)  gps.event = 23;
  //     //   else if (alarm === 3)  gps.event =  30;
  //     //   else if (alarm === 14) gps.event =  17;
  //     //   else if (alarm === 20) gps.event = 102;
  //     // }
  //
  //     console.log('location %o', locationinfo);
  // }
  //
  // /***** LOCATION PACKET *****/
  // else if (cmd == '32') {
  //     console.log('location!')
  //     let data = {}
  //     var parseData = parse(socket, buf);
  //     data = Object.assign(data, parseData);
  //     data.id = socket.name;
  //     console.log("%o", parseData);
  //     // next();
  // }
  // /***** ONLINE COMMAND RESPONSE PACKET *****/
  // else if (cmd == '21') {
  //     console.log('online command response! %s', buf)
  // }
  // /***** ALARM PACKET *****/
  // else if (cmd == '16') {
  //     console.log('alarm!')
  //     let data = {}
  //     data.id = socket.name;
  //     var parseData = parse(socket, buf);
  //     data = Object.assign(data, parseData);
  //     serialNo = buf.substr(-12, 4);
  //     // next();
  // } else {
  //   console.log('unhandled command %s', cmd);
  // }

  if (serialNo) {
    console.log('got serial number #%s', serialNo);
    
    const content = `05${cmd}${serialNo}`;
    const crcCheck = crc16(content, 'hex').toString(16);
    let str = new Buffer(`7878${content}${'0000'.substr(0, 4 - crcCheck.length) + crcCheck}0D0A`, 'hex');
    socket.write(str);
  }
}

const processSinglePacket = (socket, buf) => {
  
  let cmd = '';
  let infocontent = '';
  let serialNo = '';
  if (buf.substr(0,4)=='7878') {
    // size stored in 1 byte
    cmd = buf.substr(3*2,1*2);
    infocontent = buf.substr(4*2, buf.length-11*2);
    serialNo = buf.substr(-6*2, 2*2);
  } else if(buf.substr(0,4)=='7979') {
    // size stored in 2 bytes
    cmd = buf.substr(4*2,1*2);
    infocontent = buf.substr(5*2, buf.length-11*2);
    serialNo = buf.substr(-6*2, 2*2);
  } else {
    // don't know what to do. Don't reply
    serialNo='';
  }
  
  if(serialNo!='') {
    processInfoContent(cmd, infocontent, serialNo, socket)
  }
}

// 98/0000080355951092273478010008020404100132537002000a8931440301450430341f03001055e98ebf946befbc7507672f0c6035bb040006c4a82807ecc105000630303030303006001020572f52364b3f473050415811632d2b07001d47423131305f31305f413144455f4432335f52305f5630325f57494649
// 98/0000080355951092273478010008020404100132537002000a8931440301450430341f03001055e98ebf946befbc7507672f0c6035bb040006c4a82807ecc105000630303030303006001020572f52364b3f473050415811632d2b07001d47423131305f31305f413144455f4432335f52305f5630325f57494649


 

var server = net.createServer(function(socket) {
  // console.log('incoming connection from %s',  socket.remoteAddress);
  socket.on('data', function(data) {
    const buf = data.toString('hex');
    const cmdSplit = buf.split(/(?=7878|7979)/gi)
    cmdSplit.map( buf => {
      processSinglePacket(socket, buf);
    });
    
    if('name' in socket) {
      
    }
  });
  //  // console.log('GOING TO WRITE...')
  // // console.log(sendCommand('UNLOCK#'));
  // console.log(sendCommand('WHERE#'));
  socket.write(
    // sendCommand('UNLOCK#')
    // sendCommand('LJDW#');
    sendCommand('WHERE#')
    // sendCommand('GPSON#')
  );
	// socket.write('Echo server\r\n');
	// socket.pipe(socket);
});

console.log('starting server on port')

let port = 9020;                // listening port
let serverip = '0.0.0.0'; // external IP address for this server

console.log('starting server on %s:%s', serverip, port);
server.listen(port, serverip);