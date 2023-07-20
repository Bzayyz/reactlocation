/* eslint-disable no-undef */
function go(url, callback) {
  const win = window.open(url);

  if (callback) {
    callback(win);
  }
}

function replace(url, callback) {
  const win = window.location.replace(url);
}

export { go, replace };
