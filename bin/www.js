#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require("../app");
var debug = require("debug")("crm-katec-be:server");
var http = require("http");

let fs = require("fs");

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || "6000");
var hostname = process.env.HOST_NAME || "localhost";

app.set("port", port);

/**
 * Create HTTP server.
 */

if (process.env.NODE_ENV === "development") {
    let http = require("http");

    var server = http.createServer(app);
} else if (process.env.NODE_ENV === "production") {
    let https = require("https");
    let httpsOptions = {
        key: fs.readFileSync(
            `/etc/pki/tls/private/${port == 3155 ? "apicrm.katec.vn.key" : "apicrmdemo.katec.vn.key"}`,
            "utf8"
        ),
        cert: fs.readFileSync(
            `/etc/pki/tls/certs/${port == 3155 ? "apicrm.katec.vn.cert" : "apicrmdemo.katec.vn.cert"}`,
            "utf8"
        ),
    };
    var server = https.createServer(httpsOptions, app);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, hostname);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
    console.log(`Server listening on ${hostname}:${port}`);
}