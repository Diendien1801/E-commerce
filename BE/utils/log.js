let crawlerLogs = [];

function addLog(level, message, type = "system", data = null) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    type,
    data,
  };
  crawlerLogs.unshift(log);
  if (crawlerLogs.length > 1000) crawlerLogs = crawlerLogs.slice(0, 1000);
  return log;
}

function getLogs() {
  return crawlerLogs;
}

function clearLogs() {
  crawlerLogs = [];
}

module.exports = { addLog, getLogs, clearLogs };
