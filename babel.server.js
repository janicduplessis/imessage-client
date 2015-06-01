require('babel/register')({
	stage: 1,
  sourceMap: 'inline',
});

require('./src/server/server');

