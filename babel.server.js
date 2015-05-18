var piping = require('piping');

require('babel/register')({
	stage: 1,
});

if (false && process.env.NODE_ENV !== 'production') {
  if(piping({hook: true})) {
    require('./src/server/server');
  }
} else {
  require('./src/server/server');
}
