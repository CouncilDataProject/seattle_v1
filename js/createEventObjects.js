// Basic Event Objects
function createEventObjects(target, widthOfElements, devPrints) {
  let data = getDataFromDB(firebaseDB, '/events/', cleanEventsInfoJSON, devPrints);

  let widthOfTarget = $(target).width();
  let nLimit = Math.floor(widthOfTarget / widthOfElements);

  if (nLimit < 1) {
    nLimit = 1;
  }

  $(target).children().remove();

  for (let i = 0; i < nLimit; i++) {
    createSingleEventObject(target, data[i], devPrints);
  }

  return 'completed';
};

function createSingleEventObject(target, datum, devPrints) {
  $(target).append(
    $('<div/>')
      .attr('id', ('recent-content-' + datum.naming))
      .addClass('event-card border-1px-solid-main border-radius-5px height-140px-min width-300px space-right-40px drop-shadow-standard transition-all-150')
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

  $(document).on('click', ('#' + 'recent-content-' + datum.naming), displayEventDetails);
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
function displayEventDetails(e) {
  let targetId = e.target.id;
  let target = targetId.split('-')[2];

  let fullVersioning = getDataFromDB(firebaseDB, ('/transcipt_versioning/' + target + '/'), convertJSONtoArray, true);

  let mostRecent = fullVersioning.length - 1;
  return fullVersioning[mostRecent].full_text;
};

// Running
createEventObjects('#recent-content', 340, true);

$(window).resize(function() {
  createEventObjects('#recent-content', 340, false);
});
