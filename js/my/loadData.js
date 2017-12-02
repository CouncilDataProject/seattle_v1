// Initialize Firebase
var config = {
    apiKey: "AIzaSyCZkaEzqcssHT6DW08-rjeziGXvwV_1NJA",
    authDomain: "cdp-sea.firebaseapp.com",
    databaseURL: "https://cdp-sea.firebaseio.com",
    projectId: "cdp-sea",
    storageBucket: "cdp-sea.appspot.com",
    messagingSenderId: "14332015313"
};

const firebaseApp = firebase.initializeApp(config);
const firebaseDB = firebase.database();

// levenshtein distance from https://github.com/gustf/js-levenshtein/blob/master/index.js
function _min(d0, d1, d2, bx, ay) {
  return d0 < d1 || d2 < d1
      ? d0 > d2
          ? d2 + 1
          : d0 + 1
      : bx === ay
          ? d1
          : d1 + 1;
};

function leven_distance(a, b) {
  if (a === b) {
    return 0;
  }

  if (a.length > b.length) {
    var tmp = a;
    a = b;
    b = tmp;
  }

  var la = a.length;
  var lb = b.length;

  while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
    la--;
    lb--;
  }

  var offset = 0;

  while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
    offset++;
  }

  la -= offset;
  lb -= offset;

  if (la === 0 || lb === 1) {
    return lb;
  }

  var x = 0;
  var y;
  var d0;
  var d1;
  var d2;
  var d3;
  var dd;
  var dy;
  var ay;
  var bx0;
  var bx1;
  var bx2;
  var bx3;

  var vector = [];

  for (y = 0; y < la; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }

  for (; (x + 3) < lb;) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    bx1 = b.charCodeAt(offset + (d1 = x + 1));
    bx2 = b.charCodeAt(offset + (d2 = x + 2));
    bx3 = b.charCodeAt(offset + (d3 = x + 3));
    dd = (x += 4);
    for (y = 0; y < vector.length; y += 2) {
      dy = vector[y];
      ay = vector[y + 1];
      d0 = _min(dy, d0, d1, bx0, ay);
      d1 = _min(d0, d1, d2, bx1, ay);
      d2 = _min(d1, d2, d3, bx2, ay);
      dd = _min(d2, d3, dd, bx3, ay);
      vector[y] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }
  for (; x < lb;) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    dd = ++x;
    for (y = 0; y < vector.length; y += 2) {
      dy = vector[y];
      vector[y] = dd = dy < d0 || dd < d0
          ? dy > dd ? dd + 1 : dy + 1
          : bx0 === vector[y + 1]
              ? d0
              : d0 + 1;
      d0 = dy;
    }
  }

  return dd;
};

function checkPathExists(pathHead, pathKey) {
  if (firebaseDB.ref(pathHead + pathKey + "/").once("value").then(function(snapshot) { return snapshot.exists(); })) {
    return true;
  } else {
    return false;
  }
};

// Cleaning Functions
function addMillisecondDateToData(data, label) {
  for (let key in data) {
    data[key][label] = new Date(data[key].datetime).getTime();
  }

  return data;
};

function convertJSONtoArray(data) {
  let arr = [];

  for (let key in data) {
    arr.push(data[key])
  }

  return arr;
};

function filterElementByKeyUndefined(data, key) {
  let arr = [];

  for (let item in data) {
    if (data[item][key] != undefined) {
      arr.push(data[item]);
    }
  }

  return arr;
};

function combineJSONWithArrayOnKey(json, arr, matchAttr) {
  for (let key in arr) {
    let matchKey = arr[key][matchAttr];

    if (json[matchKey] != undefined) {
      for (let attr in arr[key]) {
        json[matchKey][attr] = arr[key][attr];
      }
    }
  }

  return json;
};

function orderListByParam(data, orderedBy, ascDesc) {
  return alasql(("SELECT * FROM ? ORDER BY " + orderedBy + " " + ascDesc), [data]);
};

function listWhereByParam(data, key, qualifier, whereBy) {
  return alasql(("SELECT * FROM ? WHERE " + key + qualifier + "'" + whereBy + "'"), [data]);
};
