# imessage-client

Web application for iMessage

It uses a mac app to communicate with the server and send new messages as they are received. The server can also communicate with the mac app to send messages to iMessage.

Warning, this is not ready for use at all and is missing crucial security features. It is meant mainly as a tech demo and fun project.

## Installation

Both the server and mac client use [iojs](https://iojs.org/en/index.html). It is also possible to use node instead by modifying the scripts in package.json

### Server

The server is the main package. To install dependencies, from the project root, run

    npm install

It also require a rethinkdb database running. See http://rethinkdb.com/docs/install/ for more info on how to install it.

Inside the config folder, there is a server.default.json file with default values for the database configuration. You can create a server.user.json file to override the default configuration. It is also possible to configure the server using environnement variables or command line flags.

The server uses webpack for bundling the client's javascript. To build the bundle, use

    npm run build

Or watch for changes and rebuild automatically with

    npm run watch-client
    
To start the server, use

    npm run start

The server should be running on http://localhost:8000

### Mac client

The Mac client is used to get messages from the imessage database and send messages using AppleScript.

To install the dependencies browse to the mac client directory

    cd src/mac
    
Then run

    npm install
    
To start the mac client use

    npm run start
    
