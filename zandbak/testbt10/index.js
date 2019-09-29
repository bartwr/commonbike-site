// experimental code for Concox BL10 lock socket server
//
// parse code borrowed from https://gitlab.com/elyez/concox

const net = require('net');
const util = require('./util')
const crc16 = require('crc16-itu')
const dateFormat = require('dateformat');
const fs = require('fs');
var locks = [];

var locks = {};

// createSendCommand()
//
// For documentation, see:
// 'BL10 GPS tracker communication protocolV1.0.8  20180408.pdf'
const createSendCommand = (command) => {
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
      
      if (serialNo) {
        const utcdatetime = dateFormat(new Date(), 'yymmddHHMMss', true);
        let content = `01${utcdatetime}00${serialNo+1}`;
        content = util.decimalToHexString(content.length) + content;
        const crcCheck = crc16(content, 'hex').toString(16);
        let response = `7878${content}${'0000'.substr(0, 4 - crcCheck.length) + crcCheck}0D0A`
        let str = new Buffer(response, 'hex');
        console.log('replying with ' + response);
        socket.write(str);
      }
      
      break;
    case '21': // online command response
      let info = {
        length: infocontent.substr(0*2,1),
        content: new Buffer(infocontent.substr(5*2), 'hex'),
      }
      console.log("command response from %s (length: %s) [%s]", socket.name, info.length, info.content);
      console.log("source string: %s", new Buffer(infocontent, 'hex'));
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
  
      // console.log("heartbeat from %s (locked: %s / charging: %s / gpspositioning: %s / voltage: %s / gsm signal: %s)", socket.name, hbtinfo.locked, hbtinfo.charging, hbtinfo.gpspositioning, hbtinfo.voltage, hbtinfo.gsmstrength);
      break;
    case '32':  // normal location
    case '33':  // alarm location
      let infolength=12; // util.hex2int(infocontent.substr(6*2,1*2));
      let gpsinfo;
      
      console.log('baseinfo lat %s %s',infocontent.substr(8*2,4*2), util.hex2int(infocontent.substr(8*2,4*2)));
      
      if(infolength==12) {
        gpsinfo = {
          gpstime   : util.toTime(infocontent.substr(0*2,2), infocontent.substr(1*2,2), infocontent.substr(2*2,2), infocontent.substr(3*2,2), infocontent.substr(4*2,2), infocontent.substr(5*2,2), 'hex'),
          infolength: util.hex2int(infocontent.substr(6*2,1*2)),
          unknown1 : infocontent.substr(7*2,1), // split byte @ 7x2 -> high nibble = ??? / low nibble = nsats for tracking
          satellitecount : util.hex2int(infocontent.substr(7*2+1,1)),
          latitude  : parseFloat(util.hex2int(infocontent.substr(8*2,4*2)) / 1800000),
          longitude : parseFloat(util.hex2int(infocontent.substr(12*2,4*2)) / 1800000),
          speed     : util.hex2int(infocontent.substr(16*2,1*2)),
          coursestatus : infocontent.substr(17*2,2*2),
          received  : new Date().toISOString(),
        };
        // TODO: decodeMBSL/MCC/MNC/CI/RSSI and rest
        
        // let status='unknown';
        // let data =
        // if(cmd=='32') {
        //   switch()
        // } else if(cmd=='33') {
        //
        // }

        console.log("location from %s (%s)", socket.name, JSON.stringify(gpsinfo));
      } else {
        console.log("empty location record from %s", socket.name);
      }
    
      break;
    default:
      console.log("unhandled command %s from %s (%s)", cmd, socket.name, infocontent)
      break;
    case '98':
      
      let moduleidx=1;
      let startidx=0;
      let itpinfo = {};
      while (startidx<infocontent.length) {
        let typehex=infocontent.substr(startidx*2,1*2);
        let moduletype='unknown'+moduleidx;
        switch(typehex) {
          case '00': moduletype='IMEI'; break;
          case '01': moduletype='IMSI'; break;
          case '02': moduletype='ICCID'; break;
          case '03': moduletype='ChipID'; break;
          case '04': moduletype='BluetoothMac'; break;
        }
        
        let modulelength=util.hex2int(infocontent.substr((startidx + 1)*2,2*2));
        if(modulelength>0) {
          console.log('found entry of type %s of %s bytes', typehex, modulelength)
          let tmpstr=infocontent.substr((startidx + 3)*2, modulelength*2);
          itpinfo[moduletype]=tmpstr;
          let buffer = new Buffer(infocontent.substr((startidx + 3)*2, modulelength*2),'hex');
          console.log("data: %s", buffer)
        }

        startidx+=3+modulelength;
        moduleidx+=1;
      }
    
      console.log('information transmission %o', itpinfo);
      break;
  }

  if (serialNo) {
    console.log('got serial number #%s', serialNo);
    
    const content = `05${cmd}${serialNo}`;
    const crcCheck = crc16(content, 'hex').toString(16);
    let response = `7878${content}${'0000'.substr(0, 4 - crcCheck.length) + crcCheck}0D0A`;
    let str = new Buffer(response, 'hex');
    socket.write(str);
    console.log("sending %s", response)

    if(parseInt(serialNo)%100==2) {
      console.log("++++++++++asking for location+++++++++++++++++++++++++++++++++");
      // socket.write(createSendCommand('RESET#')); // reboot lock
      // socket.write(createSendCommand('PARAM#'));
//      socket.write(createSendCommand('LJDW#'));
      // socket.write(createSendCommand('WHERE#'));
      // socket.write(createSendCommand('GTIMER,3#'));
      socket.write(createSendCommand('GPSON#'));
      // socket.write(createSendCommand('GTIMER#'));
      // socket.write(createSendCommand('LJDW#'));
    }
    if(parseInt(serialNo)%100==5) {
      socket.write(createSendCommand('LJDW#'));
    }
    
  }
}

const processSinglePacket = (socket, buf) => {
  
  let cmd = '';
  let length = 0;
  let infocontent = '';
  let serialNo = '';
  if (buf.substr(0,2*2)=='7878') {
    // size stored in 1 byte
    length = util.hex2int(buf.substr(2*2,1*2));
    cmd = buf.substr(3*2,1*2);
    infocontent = buf.substr(4*2, buf.length-11*2);
    serialNo = buf.substr(-6*2, 2*2);
  } else if(buf.substr(0,4)=='7979') {
    // size stored in 2 bytes
    length = util.hex2int(buf.substr(3*2,1*2));
    cmd = buf.substr(4*2,1*2);
    infocontent = buf.substr(5*2, buf.length-11*2);
    serialNo = buf.substr(-6*2, 2*2);
  } else {
    // don't know what to do. Don't reply
    serialNo='';
  }
  
  console.log('got %s / l: %s / actual: %s', cmd, length, buf.length);
  
  if(serialNo!='') {
    processInfoContent(cmd, infocontent, serialNo, socket)
    let line = socket.name + ";" + serialNo + ";" + cmd + ";" + infocontent+"\n";
    fs.appendFile('received-commands.txt', line, function (err) {
      if (err) throw err;
    });
  }
}

// let data_98 = '0000080355951092273478010008020404100132537002000a8931440301450430341f03001055e98ebf946befbc7507672f0c6035bb040006c4a82807ecc105000630303030303006001020572f52364b3f473050415811632d2b07001d47423131305f31305f413144455f4432335f52305f5630325f57494649';
// let data_32_protocol = '7979006F33110314090608000901CC00287D001F400E24287D001F7107287D001E3F060000000000000000000000000000000000000000000000003100367605BB5D4600873631875B48CC7B353661A64C00E04B8CBF584F78A1065415DE4F0087461B9D84';
// let data32 = '13091c072602000900cc0400de006eb72f2400de006eb51e00de0085901d00de0042741500de00eb051400de00b5af1300de00eb0610000000';
// let data_32 = '13091710262e000900cc0400de006eb7332400de0044172500de0085902300de0042741a00de00eb051800de00e7fc1400de00e7fd11000000';

let dummysocket = {
    name: 'dummy-socket',
    write:(info) => {
      console.log('socket writes %s', info.toString('hex'));
    }
}

const doFindLatLong = (data) => {
  for(let i=0; i<(data.length/2)-7; i++) {
    console.log("%s - %s/%s - %s, %s", i, data.substr(i*2,4*2), data.substr((i+4)*2,4*2), parseFloat(util.hex2int(data.substr(i*2,4*2)) / 1800000), parseFloat(util.hex2int(data.substr((i+4)*2,4*2)) / 1800000))
  }
}

const doTestRun = () => {
  var contents = fs.readFileSync('received-commands.txt', 'utf-8')
  // console.log(contents);
  const lines = contents.split('\n');
  lines.forEach((line,index)=> {
    let [imei, sequence, command, infoContent ] = line.split(';')
    // console.log(command, index);
    if((command=='32')) {
      console.log("%s - %s - %s, %s", index, imei, command, infoContent);
      processInfoContent(command, infoContent, 1, dummysocket);
    }
  });
};

// doTestRun();
// doFindLatLong(data_32_protocol);
// processInfoContent('98', data_98, 1, dummysocket);
// processSinglePacket(dummysocket, data_32_protocol);
// processInfoContent('32', data_32, 1, dummysocket);

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
  // // console.log(createSendCommand('UNLOCK#'));
  // console.log(createSendCommand('WHERE#'));
  // socket.write(createSendCommand('GPSON#'));
  // socket.write(createSendCommand('LJDW#'));
  // createSendCommand('UNLOCK#')
  // createSendCommand('WHERE#')
  // createSendCommand('GPSON#')

	// socket.write('Echo server\r\n');
	// socket.pipe(socket);

  socket.on('error', function(data) {
    console.log("%o",data);
  })
});

console.log('starting server on port')

let port = 9020;                // listening port
let serverip = '0.0.0.0'; // external IP address for this server

console.log('starting server on %s:%s', serverip, port);
server.listen(port, serverip);

// let test='01c8e2cc';
//
// let buf = Buffer.from(test, 'ascii');
// console.log(test,buf);
// // console.log(v);
// // console.log(parseFloat(util.hex2int(test) / 1800000));
//
// var bufInt = (buf.readUInt32BE(0) << 8) + buf.readUInt32BE(4);
// console.log(bufInt)