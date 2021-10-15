const { https } = require('firebase-functions')
const express = require('express')
const gqlServer = require('./graphql/server')
const server = gqlServer();

exports.api = https.onRequest(server)
