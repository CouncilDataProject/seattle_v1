// Basic Event Objects
function getEventsInfoData(devPrints) {
  return getDataFromDB(firebaseDB, '/events/', cleanEventsInfoJSON, true, devPrints);
};

function createEventObjects(data, params, devPrints) {
  if (devPrints) { console.log('Creating Event Objects for:', params.target); }

  let widthOfTarget = $(params.target).width();
  let nLimit = 1;
  let setClass = 'width-';

  if (typeof params.widthOfElements == 'string') {

    if (devPrints) { console.log('Elements will be created with percentage width...'); }

    let splitWidth = params.widthOfElements.slice(0, -1);
    // setClass += 'fill-from-' + splitWidth + '-percent';
    setClass += splitWidth + '-percent';

    let decimalWidth = parseFloat(splitWidth) / 100;
    nLimit = Math.floor((decimalWidth * widthOfTarget) / widthOfTarget);

  } else {

    if (devPrints) { console.log('Elements will be created with pixel width...'); }

    let withoutPadding = params.widthOfElements - 40;
    setClass += withoutPadding + 'px space-right-40px';
    nLimit = Math.floor(widthOfTarget / params.widthOfElements);

  }

  if (nLimit < 1) {
    nLimit = 1;
  }

  nLimit *= params.rows

  if (params.rows > 1 && nLimit > params.max) {
    nLimit = params.max;
  }

  if (devPrints) { console.log('Removing previous children of target and creating new children...'); }

  $(params.target).children().remove();

  for (let i = 0; i < nLimit; i++) {
    createSingleEventObject(params.target, data[i], setClass);
  }

  return 'Completed';
};

function createSingleEventObject(target, datum, widthClass) {
  $(target).append(
    $('<div/>')
      .attr('id', ('recent-content-' + datum.naming))
      .addClass('event-card border-1px-solid-main border-radius-5px height-160px-min ' + widthClass + ' space-bottom-20px drop-shadow-standard transition-all-150')
      .append(
        $('<h4/>')
          .attr('id', ('recent-content-' + datum.naming + '-card-header'))
          .addClass('header-minor-text color-text-darker space-top-10px space-left-10px space-right-10px')
          .text(datum.body)
      )
      .append(
        $('<p/>')
          .attr('id', ('recent-content-' + datum.naming + '-card-date'))
          .addClass('sub-text color-text-main space-left-10px space-right-10px border-bottom-1px-solid-main')
          .text(createReadableDate(datum.datetime))
      )
      .append(
        $('<p/>')
          .attr('id', ('recent-content-' + datum.naming + '-card-agenda'))
          .addClass('sub-text color-text-main space-all-10px')
          .text(datum.agenda)
      )
  );

  $(document).on('click', ('#' + 'recent-content-' + datum.naming), routeToEventDetails);
};

function createReadableDate(dateString) {
  let readDate = new Date(dateString);
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let day = days[readDate.getDay()];
  let date = readDate.getDate();
  let month = months[readDate.getMonth()];
  let year = readDate.getFullYear();

  return day + ', ' + date + ' ' + month + ', ' + year;
};

// Advanced Event Objects
function routeToEventDetails(e) {
  let target = e.target.id.split('-')[2];

  let goTo = (window.location.protocol + '//' + window.location.host + '/#/event=' + target);
  window.location.href = goTo;
};

// Event Objects Runner
function eventObjectsHandler(db, path, cleaningFunction, createItemsFunction, createItemsParamsObject, storeData, devPrints) {
  getDataFromDB(db, path, cleaningFunction, createItemsFunction, createItemsParamsObject, true, devPrints);

  $(window).resize(function() {
    getDataFromDB(db, path, cleaningFunction, createItemsFunction, createItemsParamsObject, true, devPrints);
  });
};
