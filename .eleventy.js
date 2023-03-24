const { EleventyEdgePlugin } = require("@11ty/eleventy");

module.exports = function (config) {
   config.addPlugin(EleventyEdgePlugin);
   config.addWatchTarget("./styles.css");
 };
 