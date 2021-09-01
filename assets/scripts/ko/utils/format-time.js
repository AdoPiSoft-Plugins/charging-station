define(function () {
  function paddStart (i) {
    i = i + ''
    if (i.length >= 2) {
      return i
    } else {
      return '0' + i
    }
  }

  return function formatTime (time_seconds) {
    var t = time_seconds
    var hh = 0, mm = 0, ss = 0;
    if (t > 3600) {
      hh = parseInt(t / 3600)
      t = t - (hh * 3600)
    }
    if (t > 60) {
      mm = parseInt(t / 60)
      t = t - (mm * 60)
    }
    ss = t
    return {
      hh: paddStart(hh),
      mm: paddStart(mm),
      ss: paddStart(ss)
    }
  };
});