exports.randomPickFromArray = function(a) {
  if (!!a && a.length > 0) {
    return a[Math.floor(Math.random() * a.length)];
  }

  return null;
}
