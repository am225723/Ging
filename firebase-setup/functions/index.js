const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
exports.journalAi = require("./journal-ai").journalAi;
exports.exposureLadder = require("./exposure-ladder").exposureLadder;
exports.reframeForge = require("./reframe-forge").reframeForge;