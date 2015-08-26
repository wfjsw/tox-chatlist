var toxcore = require('toxcore');
var config = require('./config.example.js');
var fs = require('fs');
var tox;
if (fs.existsSync('save.tox')) 
    tox = new toxcore.Tox({
        path: config.lib_path,
        data: 'save.tox'
    });
else
    tox = new toxcore.Tox({
        path: config.lib_path
    });

// Specify nodes to bootstrap from
var bootstrap_nodes = require('./bootstrap_nodes.js');
var friends = new Array();

// Bootstrap from nodes
bootstrap_nodes.nodes.forEach(function(node) {
  tox.bootstrapSync(node.address, node.port, node.key);
  console.log('Successfully bootstrapped from ' + node.maintainer + ' at ' + node.address + ':' + node.port);
  console.log('... with key ' + node.key);
});

tox.on('selfConnectionStatus', function(e) {
  console.log(e.isConnected() ? 'Connected' : 'Disconnected');
});

tox.on('friendRequest', function(e) {
    var friend = tox.addFriendNoRequestSync(e.publicKey());
    console.log('Received friend request: ' + e.message());
    console.log('Accepted friend request from ' + e.publicKeyHex());
    tox.sendFriendMessage(friend, config.welcome, 0); // CONFIG ITEM
    friends = tox.getFriendListSync();
});

// Event to write config on exit.
process.on('SIGINT', function(code) {
    console.log('About to exit with code:', code);
    tox.saveToFileSync('save.tox');
    tox.stop();
    process.exit();
});
// End Exit Event.

tox.on('friendMessage', function (e) {
    var name = tox.getFriendNameSync(e.friend());
    friends.forEach(function (peer){
        if (peer != e.friend())
        tox.sendFriendMessage(peer, "[" + name + "] " + e.message(), e.messageType(), function (err, val) { if (err) console.log("Error: " + err); } );
    })
});

tox.setNameSync(config.name);
tox.setStatusMessageSync(config.stat);

console.log('Address: ' + tox.getAddressHexSync());
tox.start();
friends = tox.getFriendListSync();
