sentinel = require('redis-sentinel');
var endpoints = [ { host : '127.0.0.1', port : 26379 },
		  { host : '127.0.0.1', port : 26380 },
		  { host : '127.0.0.1', port : 26381 } ];

var redis = sentinel.createClient(endpoints, 'lrvlm', {});

var ready = false;
var last = 0;
redis.on('idle', function() {
  if (ready == false) { console.log("Idle, but not ready."); return; }
  redis.get('val', function(err, reply) {
    if (err) { console.log("Error: ", err); return; }
    if (reply != last) {
      console.log("Incorrect value!", reply, "!=", last);
      return;
    }
    redis.incr('val', function(err, reply) {
      if (err) { return; }
      last = reply;
      if (0 == last % 10000) { console.log(last) };
     });
  });
});

redis.on('ready', function() {
  redis.set('val', 0, function(err, reply) {
    if (!err) {
      console.log("Ready");
      ready = true;
      redis.emit('idle');
    }
  });
});

