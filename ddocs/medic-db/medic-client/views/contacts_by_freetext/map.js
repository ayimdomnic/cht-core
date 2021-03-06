function(doc) {
  var skip = [ '_id', '_rev', 'type', 'refid', 'geolocation' ];

  var usedKeys = [];
  var emitMaybe = function(key, value) {
    if (usedKeys.indexOf(key) === -1 && // Not already used
        key.length > 2 // Not too short
    ) {
      usedKeys.push(key);
      emit([key], value);
    }
  };

  var emitField = function(key, value, order) {
    if (!key || !value) {
      return;
    }
    key = key.toLowerCase();
    if (skip.indexOf(key) !== -1 || /_date$/.test(key)) {
      return;
    }
    if (typeof value === 'string') {
      value = value.toLowerCase();
      value.split(/\s+/).forEach(function(word) {
        emitMaybe(word, order);
      });
    }
    if (typeof value === 'number' || typeof value === 'string') {
      emitMaybe(key + ':' + value, order);
    }
  };

  var types = [ 'district_hospital', 'health_center', 'clinic', 'person' ];
  var idx;
  if (doc.type === 'contact') {
    idx = types.indexOf(doc.contact_type);
    if (idx === -1) {
      idx = doc.contact_type;
    }
  } else {
    idx = types.indexOf(doc.type);
  }

  if (idx !== -1) {
    var dead = !!doc.date_of_death;
    var muted = !!doc.muted;
    var order = dead + ' ' + muted + ' ' + idx + ' ' + (doc.name && doc.name.toLowerCase());
    Object.keys(doc).forEach(function(key) {
      emitField(key, doc[key], order);
    });
  }
}
