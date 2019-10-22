import { ApiKeys } from '/imports/api/api-keys.js'
import { Objects, getStateChangeNeatDescription } from '/imports/api/objects.js'
import { UpdatePaymentOrder, UpdateAllPaymentOrders } from '/server/api/paymentservices/mollie.js'
import { getSettingsServerSide, Settings } from '/imports/api/settings.js';

// demo of concox bl-10 usage (localhost)
//
// 1. Create a new bike with name "BL10 Demo bike"
// 2. Go to bike settings (click info from my locations -> location -> API Demo Bike)
// 3. Set lock type to "open-bikelocker" (Instellingen -> Slot section -> open bikelocker -> save settings)
// 4. Create an API key for the lock (API keys -> set beschrijving to "api demo" -> click "+")
// 5. Copy API key to a text document (click on clipboard icon)
//
// now test the API:
//
// using a webbrowser:
//
// set in use:
//   http://localhost:3000/api/locker/v1?api_key=<your key here>&cardhash=00000000&pincode=12345&timestamp=1&action=inuse
//
// set available:
//   http://localhost:3000/api/locker/v1?api_key=<your key here>&cardhash=00000000&pincode=12345&timestamp=1&action=available
//
// using curl:
//
// set in use:
// curl -X POST \
//   http://localhost:3000/api/locker/v1/ \
//   -H 'cache-control: no-cache' \
//   -H 'content-type: application/x-www-form-urlencoded' \
//   -d 'api_key=<your key here>&cardhash=00000000&pincode=12345&timestamp=1&action=inuse'
//
// set available:
// curl -X POST \
//   http://localhost:3000/api/locker/v1/ \
//   -H 'cache-control: no-cache' \
//   -H 'content-type: application/x-www-form-urlencoded' \
//   -d 'api_key=<your key here>&cardhash=00000000&pincode=12345&timestamp=1&action=available'

// experimental code for Concox BL10 lock socket server
//
// parse code borrowed from https://gitlab.com/elyez/concox

const net = require('net');
const util = require('./concox-bl10-util')
const crc16 = require('crc16-itu')
const dateFormat = require('dateformat');
const fs = require('fs');
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
  // console.log("==== processing %s/%s", cmd, infocontent)
  if(cmd=='01') { // process login command -> should always come first
    // TODO: decode timezone info
    let imei = infocontent.substr(0,8*2);
    socket.lockid = imei;

    if(!(socket.lockid in locks)) {
      console.log('create new lock with ID %s', socket.lockid);
      locks[socket.lockid]={
        lockid: socket.lockid
      }
    }
  } else {
    if(!"lockid" in socket) {
      console.warn("received command on unnamed socket. Ignoring command");
      return; // should not happen!
    }
  }
  
  let thelock = locks[socket.lockid];
  
  thelock.lastts = dateFormat(new Date(), 'yymmddHHMMss', true);
  thelock.lastserial =  serialNo;
  
  switch(cmd) {
    case '01':  // login packet
      thelock.modelcode =  infocontent.substr(8*2,2*2);
      thelock.timezone =  infocontent.substr(10*2,2*2); // TODO: decode timezone info
      
      // console.log("login from %s (model: %s / tz: %s)", cmdinfo.imei, cmdinfo.modelcode, cmdinfo.timezone);
      
      if (serialNo) {
        const utcdatetime = dateFormat(new Date(), 'yymmddHHMMss', true);
        let content = `01${utcdatetime}00${serialNo+1}`;
        content = util.decimalToHexString(content.length) + content;
        const crcCheck = crc16(content, 'hex').toString(16);
        let response = `7878${content}${'0000'.substr(0, 4 - crcCheck.length) + crcCheck}0D0A`
        let str = new Buffer(response, 'hex');
        // console.log('replying with ' + response);
        socket.write(str);
      }
      
      break;
    case '21': // online command response
      let info = {
        length: infocontent.substr(0*2,1),
        content: new Buffer(infocontent.substr(5*2), 'hex'),
      }
      // console.log("command response from %s (length: %s) [%s]", socket.lockid, info.length, info.content);
      // console.log("source string: %s", new Buffer(infocontent, 'hex'));
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
      
      thelock.hbtinfo = {
        lastdt: dateFormat(new Date(), 'yymmddHHMMss', true),
        locked: terminalinfo.substr(7,1)=='1',
        charging: terminalinfo.substr(5,1)=='1',
        gpspositioning: terminalinfo.substr(1,1)=='1',
        voltage: util.hex2int(infocontent.substr(1*2,2*2))/100,
        gsmstrength: gsmstrength
      }
  
      // console.log("heartbeat from %s (locked: %s / charging: %s / gpspositioning: %s / voltage: %s / gsm signal: %s)", socket.lockid, hbtinfo.locked, hbtinfo.charging, hbtinfo.gpspositioning, hbtinfo.voltage, hbtinfo.gsmstrength);
      break;
    case '32':  // normal location
    case '33':  // alarm location
      let infolength = util.hex2int(infocontent.substr(6*2,1*2));
      let gpsinfo = {
        gpstime   : util.toTime(infocontent.substr(0*2,2), infocontent.substr(1*2,2), infocontent.substr(2*2,2), infocontent.substr(3*2,2), infocontent.substr(4*2,2), infocontent.substr(5*2,2), 'hex'),
      }
      
      // console.log('baseinfo la/t %s %s',infocontent.substr(8*2,4*2), util.hex2int(infocontent.substr(8*2,4*2)));
      
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
        }
        // TODO: decodeMBSL/MCC/MNC/CI/RSSI and rest
        
        // let status='unknown';
        // let data =
        // if(cmd=='32') {
        //   switch()
        // } else if(cmd=='33') {
        //
        // }

        console.log("location from %s (%s)", socket.lockid, JSON.stringify(gpsinfo));
      } else {
        // console.log("empty location record from %s", socket.lockid);
      }
    
      break;
    default:
      console.log("unhandled command %s from %s (%s)", cmd, socket.lockid, infocontent)
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
          // console.log('found entry of type %s of %s bytes', typehex, modulelength)
          let tmpstr=infocontent.substr((startidx + 3)*2, modulelength*2);
          itpinfo[moduletype]=tmpstr;
          let buffer = new Buffer(infocontent.substr((startidx + 3)*2, modulelength*2),'hex');
          // console.log("data: %s", buffer)
        }

        startidx+=3+modulelength;
        moduleidx+=1;
      }
    
      // console.log('information transmission %o', itpinfo);
      break;
  }

  if (serialNo) {
    // console.log('got serial number #%s', serialNo);
    
    const content = `05${cmd}${serialNo}`;
    const crcCheck = crc16(content, 'hex').toString(16);
    let response = `7878${content}${'0000'.substr(0, 4 - crcCheck.length) + crcCheck}0D0A`;
    let str = new Buffer(response, 'hex');
    socket.write(str);
    //console.log("sending %s", response)

    // if(parseInt(serialNo)%100==2) {
    //   // console.log("++++++++++asking for location+++++++++++++++++++++++++++++++++");
    //   // socket.write(createSendCommand('RESET#')); // reboot lock
    //   // socket.write(createSendCommand('PARAM#'));
    //   // socket.write(createSendCommand('LJDW#'));
    //   // socket.write(createSendCommand('WHERE#'));
    //   // socket.write(createSendCommand('GTIMER,3#'));
    //   // socket.write(createSendCommand('GPSON#'));
    //   // socket.write(createSendCommand('GTIMER#'));
    //   // socket.write(createSendCommand('LJDW#'));
    // }
    // if(parseInt(serialNo)%100==5) {
    //   socket.write(createSendCommand('LJDW#'));
    // }
    
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
    let line = socket.lockid + ";" + serialNo + ";" + cmd + ";" + infocontent+"\n";
    fs.appendFile('received-commands.txt', line, function (err) {
      if (err) throw err;
    });
  }
}

const dumpStatus = () => {
  let output = '';
  if(locks.length==0) return output;
  
  // get all keys from all locks in tmplock
  let tmplock = {};
  Object.keys(locks).forEach((key)=>{tmplocks = Object.assign(tmplock, locks[key])});
  
  let lines = Object.keys(tmplock).map((key)=>{
      let line = new String(30,' ').substr(0, 30 - key.length) + key
      Object.keys(locks).forEach((lockkey)=>{
        // console.log("%s - %s: %s", lockkey, key, locks[lockkey][key]);
        let value = (locks[lockkey][key]||'').toString();
        line+='     ' + new String(25,' ').substr(0, 25 - value.length) + value;
      })

      console.log(line);
      return line;
  })
  
  return lines.join('\n');
}

// processes incoming commands from BL10 lock
concoxBL10API = {
  authentication: function( apiKey ) {
    var getObject = ApiKeys.findOne( { "key": apiKey, "type": "object" }, { fields: { "ownerid": 1 } } );
    if ( getObject ) {
      return getObject.ownerid;
    } else {
      return false;
    }
  },
  connection: function( request ) {
    var getRequestContents = concoxBL10API.utility.getRequestContents( request ),
        apiKey             = getRequestContents.api_key,
        validObject        = concoxBL10API.authentication( apiKey );

    if ( validObject ) {
      delete getRequestContents.api_key;
      return { owner: validObject, data: getRequestContents };
    } else {
      return { error: 401, message: "Invalid API key." };
    }
  },
  handleRequest: function( request, response, resource, method ) {
    console.log('incoming request on the locker API!');
    
    var connection = concoxBL10API.connection( request );
    if ( !connection.error ) {
      concoxBL10API.methods[ resource ]( response, connection );
    } else {
      concoxBL10API.utility.response( response, 401, connection );
    }
  },
  methods: {
    object: function( response, connection ) {
      var object = Objects.findOne({_id: connection.owner});
      if(!object) {
        Meteor.call('log.write', "request for unknown locker", connection.owner)
        concoxBL10API.utility.response( response, 404, { error: 404, message: "Unknown locker" } );
        return;
      }

      objectinfo = {
        state: object.state.state,
        timestamp: object.state.timestamp,
        username: '',
      }

      var hasData   = concoxBL10API.utility.hasData( connection.data );
      if(!hasData) {
        // send status
        concoxBL10API.utility.response( response, 200, objectinfo );
        return;
      }

      var validData = concoxBL10API.utility.validate( connection.data, { "action": String, "cardhash": String, "pincode": String, "timestamp": String });
      if (!validData) {
          Meteor.call('log.write', "invalid action request from locker ", connection.data)
          concoxBL10API.utility.response( response, 403, { error: 403, message: "POST calls must have an action, cardhash and pincode passed in the request body in the correct format." } );
      } else {
        Meteor.call('log.write', "action request from locker ", connection.data)

        var action = connection.data.action;
        var cardhash = connection.data.cardhash;
        var pincode = connection.data.pincode;
        // var timestamp = connection.data.timestamp; -> Later convert from locker date/time
        var timestamp =  new Date().valueOf();

        var userId = object.state.userId;
        var description = object.state.userDescription;
        if(cardhash=="00000000") {
          // keep existing userid / description
        } else {
          // card used to rent the locker: find if a user exists with the given cardhash as a card
          if(false) {
            // statedata.state.userId = -> id van gevonden gebruiker
            userId="";
            description="Lokaal gehuurd"
          } else {
            userId="";
            description="Lokaal gehuurd"
          }
        }

        var statedata = {
            'state.state': action,
            'state.userId': userId,
            'state.userDescription': description,
            'state.timestamp': timestamp
        }

        switch(action) {
          case 'inuse':
            Meteor.call('log.write', "API: locker " + connection.owner + " state set to inuse")
            var newState = action;
            var timestamp = new Date().valueOf();
            Objects.update({_id: object._id}, { $set: statedata });

            var object = Objects.findOne(connection.owner, {title:1, 'state.state':1 });
            var description = getStateChangeNeatDescription(object.title, newState);
            console.log(description)

            objectinfo.state = object.state.state;
            objectinfo.timestamp = object.state.timestamp;
            objectinfo.username = '';
            objectinfo.cardhash = '';

            concoxBL10API.utility.response( response, 200, objectinfo );

            break;
          case 'outoforder':
          case 'available':
            Meteor.call('log.write', "API: locker " + connection.owner + " state set to " + action);
            var newState = action;
            var timestamp = new Date().valueOf();
            Objects.update({_id: object._id}, { $set: {
                'state.userId': null,
                'state.state': newState,
                'state.timestamp': timestamp
               }
            });

            var object = Objects.findOne(connection.owner, {title:1, 'state.state':1 });
            var description = getStateChangeNeatDescription(object.title, newState);
            console.log(description)

            objectinfo.state = object.state.state;
            objectinfo.timestamp = object.state.timestamp;
            objectinfo.username = '';
            objectinfo.cardhash = '';

            concoxBL10API.utility.response( response, 200, objectinfo );
            break;
          default:
            Meteor.call('log.write', "API: locker " + connection.owner + " unable to execute " + action);
            concoxBL10API.utility.response( response, 403, { error: 403, message: "Unable to execute " + action + ". locker is " + object.state.state } );
            break;
        }
      }
    }
  },
  resources: {},
  utility: {
    getRequestContents: function( request ) {
      switch( request.method ) {
        case "GET":
          return request.query;
        case "POST":
        case "PUT":
        // case "DELETE":
          return request.body;
        }
    },
    hasData: function( data ) {
      return Object.keys( data ).length > 0 ? true : false;
    },
    response: function( response, statusCode, data ) {
      response.setHeader( 'Content-Type', 'application/json' );
      response.statusCode = statusCode;
      var json_data = JSON.stringify(data);
      response.end(json_data);
      // response.end( '{title:\'marc\'}' ); // , state: \'available\'
    },
    validate: function( data, pattern ) {
      return Match.test( data, pattern );
    }
  },
  proxyRequest: function(forwardToURL, req, res) {
    
    forwardToURL += req.url.substr(1);
    // Thanks to https://gist.github.com/cmawhorter/a527a2350d5982559bb6 for this code!
    console.log('==> Making req for ' + forwardToURL + '\n');

    req.pause();

    var options = url.parse(forwardToURL);
    options.headers = req.headers;
    options.method = req.method;
    options.agent = false;

    options.headers['host'] = options.host;

    var connector = (options.protocol == 'https:' ? https : http).request(options, function(serverResponse) {
      console.log('<== Received res for', serverResponse.statusCode, forwardToURL);
      console.log('\t-> Request Headers: ', options);
      console.log(' ');
      console.log('\t-> Response Headers: ', serverResponse.headers);

      serverResponse.pause();

      serverResponse.headers['access-control-allow-origin'] = '*';

      switch (serverResponse.statusCode) {
        // pass through.  we're not too smart here...
        case 200: case 201: case 202: case 203: case 204: case 205: case 206:
        case 304:
        case 400: case 401: case 402: case 403: case 404: case 405:
        case 406: case 407: case 408: case 409: case 410: case 411:
        case 412: case 413: case 414: case 415: case 416: case 417: case 418:
          res.writeHeader(serverResponse.statusCode, serverResponse.headers);
          serverResponse.pipe(res, {end:true});
          serverResponse.resume();
        break;

        // fix host and pass through.
        case 301:
        case 302:
        case 303:
          serverResponse.statusCode = 303;
          serverResponse.headers['location'] = 'http://localhost:'+PORT+'/'+serverResponse.headers['location'];
          console.log('\t-> Redirecting to ', serverResponse.headers['location']);
          res.writeHeader(serverResponse.statusCode, serverResponse.headers);
          serverResponse.pipe(res, {end:true});
          serverResponse.resume();
        break;

        // error everything else
        default:
          var stringifiedHeaders = JSON.stringify(serverResponse.headers, null, 4);
          serverResponse.resume();
          res.writeHeader(500, {
            'content-type': 'text/plain'
          });
          res.end(process.argv.join(' ') + ':\n\nError ' + serverResponse.statusCode + '\n' + stringifiedHeaders);
        break;
      }

      console.log('\n\n');
    });
    req.pipe(connector, {end:true});
    req.resume();
  }
};

//
// const paymentAPI = {
//   handleRequest: function(req, res) {
//     res.statusCode = 200 // res.writeHead(200, { 'Content-Type': 'text/plain' })
//     res.end()
//
//     const externalPaymentId = req.body.id
//     check(externalPaymentId, String)
//     let paymentOrder = Payments.findOne({externalPaymentId: externalPaymentId})
//     if (!paymentOrder) {
//       console.error('Unknown externalPaymentId', externalPaymentId)
//       return
//     }
//
//     // console.log('FOUND PAYMENTORDER', paymentOrder)
//     // console.log('visited payment webhook: UpdatePaymentOrder', externalPaymentId)
//     UpdatePaymentOrder(paymentOrder)
//   }
// }

//

var bodyParser = require("body-parser");
var url = require('url')
var http = require('http')
var https = require('https');
//    .use(bodyParser.json())

WebApp.connectHandlers
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use('/api/liskbike', function (req, res) {
      var settings = getSettingsServerSide();
      
      if(settings.developmentOptions.forwardRequests==false) {
        console.log("incoming lisk.bike request %o", req);

        res.setHeader('Access-Control-Allow-Origin', '*')
        if (req.method === 'OPTIONS') {
         res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
         res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS') // GET, PUT, DELETE -> not used / accepted
         res.end('Set OPTIONS.');
        } else {
          concoxBL10API.handleRequest( req, res, 'object' );
        }
      } else {
        console.log('forwarding request to ')
        concoxBL10API.proxyRequest(settings.developmentOptions.forwardRequestsURL + '/api/liskbike/', req, res);
      }
    })
    // .use('/api/payment/webhook/mollie/v1', function (req, res) {
    //   paymentAPI.handleRequest(req, res)
    // })
