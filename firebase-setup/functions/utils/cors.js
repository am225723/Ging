const cors = require("cors")({
  origin: true,
  credentials: true,
});

module.exports = cors;