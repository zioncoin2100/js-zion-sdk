import axios from 'axios';
import URI from 'urijs';

import { version } from '../package.json';

// keep a local map of server times
// (export this purely for testing purposes)
export const SERVER_TIME_MAP = {
  /* each entry will map the server domain to the last-known time and the local 
  time it was recorded
  ex:

  "equator-testnet.zion.org": {
    serverTime: 1552513039,
    localTimeRecorded: 1552513052
  }
  */
};

const EquatorAxiosClient = axios.create({
  headers: {
    'X-Client-Name': 'js-zion-sdk',
    'X-Client-Version': version
  }
});

function _toSeconds(ms) {
  return Math.floor(ms / 1000);
}

EquatorAxiosClient.interceptors.response.use((response) => {
  const hostname = URI(response.config.url).hostname();
  const serverTime = _toSeconds(Date.parse(response.headers.Date));
  const localTimeRecorded = _toSeconds(new Date().getTime());

  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(serverTime)) {
    SERVER_TIME_MAP[hostname] = {
      serverTime,
      localTimeRecorded
    };
  }

  return response;
});

export default EquatorAxiosClient;

/**
 * Given a hostname, get the current time of that server (i.e., use the last-
 * recorded server time and offset it by the time since then.) If there IS no
 * recorded server time, or it's been 5 minutes since the last, return null.
 * @param {string} hostname Hostname of a Equator server.
 * @returns {number} The UNIX timestamp (in seconds, not milliseconds)
 * representing the current time on that server, or `null` if we don't have
 * a record of that time.
 */
export function getCurrentServerTime(hostname) {
  const { serverTime, localTimeRecorded } = SERVER_TIME_MAP[hostname] || {};

  if (!serverTime || !localTimeRecorded) {
    return null;
  }

  const currentTime = _toSeconds(new Date().getTime());

  // if it's been more than 5 minutes from the last time, then null it out
  if (currentTime - localTimeRecorded > 60 * 5) {
    return null;
  }

  return currentTime - localTimeRecorded + serverTime;
}
