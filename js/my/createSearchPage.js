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

function insertSorted(element, data) {
  data.push(element);
  data.sort(function(a, b) {
    return b.relevancy - a.relevancy;
  });
  return data;
};

function predictRelevancy(search, numResults, devPrints) {

  if (devPrints) { console.log('Starting search for:', search); }

  let storageLabel = ('search=' + search);
  let timeLabel = (storageLabel + '-PreviousStoreTime');

  if ((typeof(localStorage.getItem(timeLabel)) == null) || (Date.now() - localStorage.getItem(timeLabel) > 172800000)) {
    if (devPrints) { console.log('\tPrevious store time not found or falls out of time boundary'); }

    let editDistance = true;
    let adjustedDistanceStop = 0.26;

    let splitSearch = search.split('_');

    if (devPrints) { console.log('\tUsing split:', splitSearch); }

    let basePath = '/events_tfidf/';

    return firebaseDB.ref(basePath).once('value').then(function(tfidfSnapshot) {

      let foundTranscripts = [];

      tfidfSnapshot.forEach(function(transcriptSnapshot) {

        let transcript = transcriptSnapshot.key;
        let transcriptPath = (basePath + transcript + '/');

        firebaseDB.ref(transcriptPath).once('value').then(function(transcriptSnapshot) {

          let foundTranscript = {};
          foundTranscript['naming'] = transcript;
          foundTranscript['relevancy'] = 0;
          foundTranscript['searched'] = {};

          transcriptSnapshot.forEach(function(wordSnapshot) {

            let storedWord = wordSnapshot.key;

            if (splitSearch.includes(storedWord)) {

              let storedVal = wordSnapshot.val();
              let score = (storedVal * 3);

              foundTranscript['relevancy'] += score
              foundTranscript['searched'][storedWord] = score;

            } else {

              if (editDistance) {

                for (let searchWord in splitSearch) {

                  let adjustedDistance = (leven_distance(storedWord, searchWord) / storedWord.length);

                  if (adjustedDistance < adjustedDistanceStop) {

                    let storedVal = wordSnapshot.val();
                    let score = (((1 - adjustedDistanceStop) - adjustedDistance) * wordSnapshot.val());

                    foundTranscript['relevancy'] += score;
                    foundTranscript['searched'][storedWord] = score;
                  }
                }
              }
            }
          });

          foundTranscripts = insertSorted(foundTranscript, foundTranscripts);
        });
      });

      return storeDataPull(storageLabel, timeLabel, foundTranscripts, (function(data) { return orderListByParamOnlyTopN(data, 'relevancy', 'DESC', numResults) } ), devPrints);
    });

  } else {
    if (devPrints) { console.log('\tPrevious store time was found and falls in time boundary'); }

    return getLocalData(storageLabel, devPrints);
  }
};

function handleSearch(e) {
  if (e.key == 'Enter') {
    let query = e.target.value;
    query = query.split(' ');
    query = query.join('_');

    if (window.location.href.includes('search=')) {
      console.log(predictRelevancy(query, 20, true));
    }

    let goTo = (window.location.protocol + '//' + window.location.host + '/#/search=' + query);
    window.location.href = goTo;
  }
};

function searchPageHandler(search, db, path, cleaningFunction, createItemsFunction, createItemsParamsObject, storeData, devPrints) {
  console.log(predictRelevancy(search, 20, true));

  getDataFromDB(db, path, cleaningFunction, createItemsFunction, createItemsParamsObject, true, devPrints);

  $(window).resize(function() {
    getDataFromDB(db, path, cleaningFunction, createItemsFunction, createItemsParamsObject, true, devPrints);
  });
};
