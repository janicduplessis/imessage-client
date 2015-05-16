require('babel/register')({
	stage: 1,
});

if (process.env.NODE_ENV !== "production") {
  if (!require("piping")({hook: true})) {
    return;
  }
}

require('./src/server/server');