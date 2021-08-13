function objValueToString(o) {
  Object.keys(o).forEach((k) => {
    if (typeof o[k] === "object") {
      return objValueToString(o[k]);
    }

    o[k] = "" + o[k];
  });

  return o;
}

function parseReqBody(req) {
  const entries = req.body?.entries[0] ?? "";
  delete req.body?.entries;
  return objValueToString({ ...req.body, entries });
}

module.exports = { parseReqBody };
