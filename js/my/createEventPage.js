function createEventPage(eventId) {

};

function displayEventDetails(eventId) {
  let fullVersioning = getDataFromDB(firebaseDB, ('/transcript_versioning/' + eventId + '/'), convertJSONtoArray, true);

  let mostRecent = fullVersioning.length - 1;
  return fullVersioning[mostRecent].full_text;
};

function eventPageHandler(eventId, devPrints) {
  // console.log(displayEventDetails(eventId));
};
