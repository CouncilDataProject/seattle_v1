// Initialize Firebase
var config = {
  apiKey: "AIzaSyC5KSbdwIRpNHQ1Bwfalu9qH_gxHrQ7XdU",
  authDomain: "cdp-001.firebaseapp.com",
  databaseURL: "https://cdp-001.firebaseio.com",
  projectId: "cdp-001",
  storageBucket: "cdp-001.appspot.com",
  messagingSenderId: "274887179994"
};

const firebaseApp = firebase.initializeApp(config);
const firebaseDB = firebase.database();

// Get Data Functions
function getDataFromDB(db, path, cleaningFunction, devPrints) {
  let storageLabel = path;
  let timeLabel = path + 'PreviousStoreTime';

  if (devPrints) { console.log('Getting:', storageLabel); }

  if ((typeof(localStorage.getItem(timeLabel)) == null) || (Date.now() - localStorage.getItem(timeLabel) > 86400000)) {

    if (devPrints) { console.log('\tPrevious store time not found or falls out of time boundary'); }

    return db.ref(path).once('value').then(function(snapshot) {

      if (devPrints) { console.log('\tPulled data'); }

      return storeDataPull(storageLabel, timeLabel, snapshot.val(), cleaningFunction, devPrints) || 'error in retrieving event list data from database';

    });

  } else {

    if (devPrints) { console.log('\tPrevious store time was found and falls in time boundary'); }

    return getLocalData(storageLabel, devPrints);

  }
};

function getLocalData(storageLabel, devPrints) {
  let data = JSON.parse(localStorage.getItem(storageLabel))

  if (devPrints) { console.log('\tLocal:', data); }

  return data;
};

// Store Data Functions
function storeDataPull(storageLabel, timeLabel, data, cleaningFunction, devPrints) {
  if (devPrints) { console.log('\tStoring ' + storageLabel + ' and time locally'); }

  data = cleaningFunction(data);

  localStorage.setItem(storageLabel, JSON.stringify(data));
  localStorage.setItem(timeLabel, Date.now());

  if (devPrints) { console.log('\tStored:', data); }

  return data;
};

// Cleaning Functions
function createMillisecondDate(stringDate) {
  return new Date(stringDate).getTime();
};

function addMillisecondDateToData(data) {
  for (let key in data) {
    data[key]['msDate'] = createMillisecondDate(data[key].datetime)
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

function orderListByParam(data, orderedBy, ascDesc) {
  return alasql(('SELECT * FROM ? ORDER BY ' + orderedBy + ' ' + ascDesc), [data]);
};

function orderListByParamWithFilter(data, filterLabel, filter, targetValue, orderedBy, ascDesc) {
  return alasql(('SELECT * FROM ? WHERE ' + filterLabel + ' ' + filter + ' ' + targetValue + 'ORDER BY ' + orderedBy + ' ' + ascDesc), [data]);
};

function cleanEventsInfoJSON(data) {
  data = addMillisecondDateToData(data)
  data = convertJSONtoArray(data)
  data = orderListByParam(data, 'msDate', 'DESC')

  return data;
};

// Testing
// console.log(getData(firebaseDB, '/events/', cleanEventsInfoJSON, true));
