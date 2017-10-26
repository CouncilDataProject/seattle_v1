// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter
// and then call `Vue.use(VueRouter)`.

// 1. Define route components.
// These can be imported from other files

const MainComponent = {
  // <event-cards-container label="Need Validation" dataPath="/events/"></event-cards-container>
  data: function() {
    return {
      eventsAreLoaded: false,
      selectedBody: "All",
      selectedDates: "All",
      selectedViewN: 10,
      selectedOrderBy: "DESC"
    };
  },
  computed: {
    dropdownBodies: function() {
      let ddBodiesArr = [];

      for (let eventObj in this.events) {
        if ((ddBodiesArr.indexOf(this.events[eventObj].body) == -1) && (this.events[eventObj].body != undefined)) {
          ddBodiesArr.push(this.events[eventObj].body)
        }
      }

      ddBodiesArr.unshift('All')

      return ddBodiesArr;
    },
    toViewEvents: function() {
      let eventsArr = this.events;

      eventsArr = addMillisecondDateToData(eventsArr, "msDate");
      eventsArr = convertJSONtoArray(eventsArr);
      eventsArr = filterElementByKeyUndefined(eventsArr, "datetime");

      if (this.selectedBody != "All") {
        eventsArr = listWhereByParam(eventsArr, "body", "=", this.selectedBody);
      }

      if (this.selectedDates != "All") {
        let tempDate = new Date();

        if (this.selectedDates == "One Week") {
          tempDate.setDate(tempDate.getDate() - 7);
        } else if (this.selectedDates == "One Month") {
          tempDate.setMonth(tempDate.getMonth() - 1);
        } else if (this.selectedDates == "Three Months") {
          tempDate.setMonth(tempDate.getMonth() - 3);
        } else {
          tempDate.setYear(tempDate.getFullYear() - 1);
        }

        let msDate = tempDate.valueOf();
        let timeFiltered = [];

        for (let key in eventsArr) {
          if (parseInt(eventsArr[key]["msDate"]) >= msDate) {
            timeFiltered.push(eventsArr[key]);
          }
        }

        eventsArr = timeFiltered;
      }

      eventsArr = orderListByParam(eventsArr, "msDate", this.selectedOrderBy);

      return eventsArr;
    }
  },
  firebase: function() {
    return {
      events: {
        source: firebaseDB.ref("/events/"),
        asObject: true,
        cancelCallback: function() {
          console.log("Data pull for events failed...");
        },
        readyCallback: function() {
          console.log("Data pull and sort for events complete");
          this.eventsAreLoaded = true;
        }
      }
    };
  },
  template: `
    <div id="app-content" class="flex flew-row flex-wrap align-start justify-center height-fill-from-60px width-100vw space-top-40px space-bottom-40px">
      <div id="enter-content" class="width-60-percent">
        <search-bar></search-bar>

        <div class="flex flex-row flex-wrap align-center justify-start width-100-percent border-bottom-2px-solid-darkest space-bottom-40px">
          <h3 class="section-label bold-text color-text-darkest">Recent Events:</h3>

          <div class="space-left-20px dropdown-container">
            <h4 class="gapped-text display-inline-block">Allowed Bodies:</h4>
            <select class="dropdown display-inline-block width-20-percent gapped-text space-left-10px" v-model="selectedBody">
              <option v-for="body in dropdownBodies">{{body}}</option>
            </select>
          </div>

          <div class="space-left-20px dropdown-container">
            <h4 class="gapped-text display-inline-block">Allowed Dates:</h4>
            <select class="dropdown display-inline-block width-20-percent gapped-text space-left-10px" v-model="selectedDates">
              <option>All</option>
              <option>One Week</option>
              <option>One Month</option>
              <option>Three Months</option>
              <option>One Year</option>
            </select>
          </div>

          <div class="space-left-20px dropdown-container">
            <h4 class="gapped-text display-inline-block">View:</h4>
            <select class="dropdown display-inline-block width-20-percent gapped-text space-left-10px" v-model="selectedViewN">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>

          <div class="space-left-20px dropdown-container">
            <h4 class="gapped-text display-inline-block">Sort:</h4>
            <select class="dropdown display-inline-block width-20-percent gapped-text space-left-10px" v-model="selectedOrderBy">
              <option>DESC</option>
              <option>ASC</option>
            </select>
          </div>

        </div>

        <div v-if="eventsAreLoaded" class="width-100-percent"><event-cards-container v-if="eventsAreLoaded" v-bind:displayData="toViewEvents" v-bind:viewN="selectedViewN"></event-cards-container></div>
        <div v-else class="load-dots"></div>
      </div>
    </div>`
};

Vue.component("search-bar", {
  data: function() {
    return {
      query: ""
    };
  },
  methods: {
    handleSearch: function(e) {
      if (e.keyCode === 13) {
        this.$router.push("search=" + this.query);
      }
    }
  },
  template: `
    <input v-on:keyup="handleSearch" v-model="query" class="border-none border-bottom-2px-solid-darkest color-text-darkest gapped-text width-fill-from-20px padding-left-20px space-bottom-40px" type="text" placeholder="Search events..." tabindex="0" />`
});

Vue.component("event-cards-container", {
  props: ["displayData", "viewN"],
  computed: {
    slicedData: function() {
      // let determined = Math.floor(this.$el.clientWidth / (this.$el.clientWidth / 3)) * 2;
      //
      // if (determined < 2) {
      //   determined = 2;
      // }

      return this.displayData.slice(0, this.viewN);
    }
  },
  template: `
    <div ref="eventCardsContainer" class="vue-event-cards-container">
      <div id="recent-content" class="flex flex-row flex-wrap align-start justify-start width-100-percent">
        <event-card
          v-for="object in slicedData"
          v-bind:naming="object.naming"
          v-bind:body="object.body"
          v-bind:datetime="object.datetime"
          v-bind:agenda="object.agenda"
          v-bind:searched="object.searched"
          v-bind:key="object.naming"
        ></event-card>
      </div>
    </div>`
});

Vue.component("event-card", {
  props: ["naming", "body", "datetime", "agenda", "searched"],
  computed: {
    displayDate: function() {
      let readDate = new Date(this.datetime);
      let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      let day = days[readDate.getDay()];
      let date = readDate.getDate();
      let month = months[readDate.getMonth()];
      let year = readDate.getFullYear();

      return (day + ", " + date + " " + month + ", " + year);
    }
  },
  methods: {
    routeToEventDetails: function() {
      this.$router.push("event=" + this.naming);
    }
  },
  template: `
    <div v-on:click="routeToEventDetails" class="event-card border-1px-solid-main border-radius-5px height-160px-min drop-shadow-standard text-ellipsis transition-all-150">
      <h4 class="header-minor-text color-text-darker space-top-10px space-left-10px space-right-10px">{{body}}</h4>
      <p class="sub-text color-text-main space-left-10px space-right-10px space-bottom-10px border-bottom-1px-solid-main">{{displayDate}}</p>
      <p v-for="(value, word) in searched" class="sub-text color-text-main space-left-10px space-right-10px">{{word}}: {{value}}</p>
      <p class="sub-text color-text-main space-all-10px">{{agenda}}</p>
    </div>`
});

const EventComponent = {
  props: ["event"],
  template: `
    <div id="app-content" class="flex flew-row flex-wrap align-start justify-center height-fill-from-60px width-100vw space-top-40px space-bottom-40px">
      <div id="enter-content" class="width-60-percent">
        <search-bar></search-bar>

        <event-details v-bind:event=event></event-details>
        </div>
      </div>
    </div>`
};

Vue.component("event-details", {
  props: ["event"],
  data: function() {
    return {
      viewVersion: {},
      scrollDistanceFromTop: 0,
      editing: false,
      acknowledgeCommit: false,
      acknowledgementMessage: "Undefined Acknowledgement"
    };
  },
  methods: {
    createReadableDate: function(datetime) {
      let readDate = new Date(datetime);
      let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      let day = days[readDate.getDay()];
      let date = readDate.getDate();
      let month = months[readDate.getMonth()];
      let year = readDate.getFullYear();
      let hour = readDate.getHours();
      let minutes = readDate.getMinutes();

      if (("" + hour).length < 2) {
        hour = "0" + hour;
      }

      if (("" + minutes).length < 2) {
        minutes = "0" + minutes;
      }

      if (hour == 0 && minutes == 0) {
        return (day + ", " + date + " " + month + ", " + year);
      } else {
        return (hour + ":" + minutes + " " + day + ", " + date + " " + month + ", " + year);
      }
    },
    pictureInPictureScroll: function() {
      this.scrollDistanceFromTop = window.scrollY;
      console.log(this.scrollDistanceFromTop);
    },
    changeToEditing: function() {
      this.acknowledgeCommit = false;
      this.editing = true;
    },
    changeToReading: function() {
      this.acknowledgeCommit = false;
      this.editing = false;
      this.updatedTranscript = this.viewVersion.full_text;
    },
    commitChanges: function() {
      this.acknowledgeCommit = true;
      this.acknowledgementMessage = this.checkTranscriptChanges();
      this.editing = false;
    },
    checkTranscriptChanges: function() {
      let editedTranscript = $('#transcript-editor').text();

      if (editedTranscript === this.viewVersion.full_text) {
        return "No changes were made...";
      // } else if ((leven_distance(editedTranscript, this.viewVersion.full_text) / this.viewVersion.full_text.length) > 0.2) {
      //   addVersionToValidate()
      //   return "Changes will be verified by other users."
      } else {
        let currentDatetime = new Date();
        let year = currentDatetime.getFullYear();
        let month = currentDatetime.getMonth() + 1;
        let day = currentDatetime.getDate();
        let hour = currentDatetime.getHours();
        let minutes = currentDatetime.getMinutes();

        console.log("transcript update is different, storing");

        let naming = this.info.naming.split("_")[0];

        firebaseDB.ref("/transcript_versioning/" + this.event + "/").child(this.versioning.length).set({
          full_text: editedTranscript,
          version_shortname: (naming + "_" + year + "-" + month + "-" + day + "T" + hour + "-" + minutes),
          datetime: ("" + currentDatetime)
        });

        return "Changes have been saved!";
      }
    }
  },
  firebase: function() {
    return {
      info: {
        source: firebaseDB.ref("/events/" + this.event + "/"),
        asObject: true,
        cancelCallback: function() {
          console.log("Data pull for", this.event, "info failed...");
        },
        readyCallback: function() {
          console.log("Data pull for", this.event, "info complete");
        }
      },
      versioning: {
        source: firebaseDB.ref("/transcript_versioning/" + this.event + "/"),
        cancelCallback: function() {
          console.log("Data pull for", this.event, "versioning failed...");
        },
        readyCallback: function() {
          console.log("Data pull for", this.event, "versioning complete");
        }
      }
    };
  },
  computed: {
    displayDate: function() {
      return this.createReadableDate(this.info.datetime);
    },
    displayVersioning: function() {
      let ordered = this.versioning.slice().reverse();

      this.viewVersion = ordered[0];
      return ordered;
    },
    updatedDate: function() {
      return this.createReadableDate(this.viewVersion.datetime);
    }
  },
  template: `
    <div>
      <div id="event-header" class="flex flex-row align-center justify-between width-100-percent border-bottom-2px-solid-darkest space-bottom-40px">
        <h3 class="section-label bold-text color-text-darkest">{{info.body}}</h3>
        <p class="sub-label color-text-main space-left-10px space-right-10px">{{displayDate}}</p>
      </div>
      <div class="box-shadow-standard width-100-percent space-bottom-40px">
        <div class="flex flex-wrap align-center justify-center">
          <video controls class="width-100-percent">
            <source v-bind:src="info.video" type="video/mp4"/>
          </video>
        </div>
      </div>
      <div class="space-bottom-40px">
        <h4 class="header-minor-text bold-text color-text-darkest space-bottom-10px border-bottom-2px-solid-darkest">Details:</h4>
        <p class="text-readible color-text-darker">{{info.agenda}}</p>
        <a v-bind:href="'https://seattlechannel.org' + info.link"><p class="sub-label underline color-text-main space-top-10px">Seattle Channel Event Page</p></a>
      </div>
      <div id="event-content" class="width-100-percent">
        <div class="flex flex-row align-center justify-start width-100-percent border-bottom-2px-solid-darkest space-bottom-20px">
          <h4 class="header-minor-text bold-text color-text-darkest">Transcript:</h4>
          <select v-if="!editing" class="dropdown gapped-text space-left-10px space-right-10px" v-model="viewVersion">
            <option v-for="version in displayVersioning" v-bind:value="version" class="dropdown-item">
              {{version.version_shortname}}
            </option>
          </select>
          <p class="sub-label color-text-main space-left-auto space-right-10px">Stored: {{updatedDate}}</p>
        </div>
        <div class="width-80-percent space-left-10-percent">
          <div v-if="editing">
            <div>
              <div id="transcript-editor" contenteditable class="edit-container text-readible color-text-darkest">{{viewVersion.full_text}}</div>
              <button v-on:click="commitChanges" class="button-standard-lighter-blue header-minor-text padding-all-10px space-top-20px float-right transition-all-150">Commit Changes</button>
              <button v-on:click="changeToReading" class="button-standard-lighter-orange header-minor-text padding-all-10px space-top-20px float-right transition-all-150">Discard Changes</button>
            </div>
          </div>

          <div v-else>
            <p class="text-readible color-text-darkest">{{viewVersion.full_text}}</p>
            <button v-on:click="changeToEditing" class="button-standard-lighter-blue header-minor-text padding-all-10px space-top-20px float-right transition-all-150">Edit Transcript</button>
          </div>

          <transition name="fade">
            <p v-if="acknowledgeCommit" class="hide-element acknowledgement header-minor-text color-blue-lighter padding-all-10px">{{acknowledgementMessage}}</p>
          </transition>
        </div>
      </div>
    </div>`
});

const SearchComponent = {
  props: ["query"],
  data: function() {
    return {
      eventsAreLoaded: false,
      tfidfIsLoaded: false,
      selectedBody: "All",
      selectedDates: "All",
      selectedViewN: 10
    };
  },
  computed: {
    dataIsLoaded: function() {
      return (this.eventsAreLoaded && this.tfidfIsLoaded);
    },
    searchResults: function() {
      let editDistance = true;
      let adjustedDistanceStop = 0.26;

      let splitSearch = this.query.split(' ');
      let valuableSearch = [];

      for (let split in splitSearch) {
        if (splitSearch[split].length > 1) {
          valuableSearch.push(splitSearch[split])
        }
      }

      let foundTranscripts = [];

      for (let eventObj in this.tfidf) {
        let foundTranscript = {};
        foundTranscript["naming"] = eventObj;
        foundTranscript["relevancy"] = 0;
        foundTranscript["searched"] = {};

        let multiplier = 0;

        for (let word in this.tfidf[eventObj]) {

          if (valuableSearch.includes(word)) {
            let score = (this.tfidf[eventObj][word] * 3);
            foundTranscript["relevancy"] += score;
            foundTranscript["searched"][word] = score;

            multiplier += 1;
          } else {

            if (editDistance) {
              for (let searchWord in valuableSearch) {
                let adjustedDistance = (leven_distance(word, searchWord) / word.length);

                if ((adjustedDistance < adjustedDistanceStop) && (word.length > 1)) {
                  let score = (((1 - adjustedDistanceStop) - adjustedDistance) * this.tfidf[eventObj][word]);
                  foundTranscript["relevancy"] += score;
                  foundTranscript["searched"][word] = score;

                  multiplier += 1;
                }
              }
            }
          }
        }

        foundTranscript['relevancy'] = (foundTranscript['relevancy'] * multiplier);

        foundTranscripts.push(foundTranscript);
      }

      return foundTranscripts;
    },
    dropdownBodies: function() {
      let ddBodiesArr = [];

      for (let eventObj in this.events) {
        if ((ddBodiesArr.indexOf(this.events[eventObj].body) == -1) && (this.events[eventObj].body != undefined)) {
          ddBodiesArr.push(this.events[eventObj].body)
        }
      }

      ddBodiesArr.unshift('All')

      return ddBodiesArr;
    },
    toViewEvents: function() {
      let eventsArr = this.events;

      eventsArr = combineJSONWithArrayOnKey(eventsArr, this.searchResults, "naming");

      eventsArr = addMillisecondDateToData(eventsArr, "msDate");
      eventsArr = convertJSONtoArray(eventsArr);
      eventsArr = filterElementByKeyUndefined(eventsArr, "relevancy");

      if (this.selectedBody != "All") {
        eventsArr = listWhereByParam(eventsArr, "body", "=", this.selectedBody);
      }

      if (this.selectedDates != "All") {
        let tempDate = new Date();

        if (this.selectedDates == "One Week") {
          tempDate.setDate(tempDate.getDate() - 7);
        } else if (this.selectedDates == "One Month") {
          tempDate.setMonth(tempDate.getMonth() - 1);
        } else if (this.selectedDates == "Three Months") {
          tempDate.setMonth(tempDate.getMonth() - 3);
        } else {
          tempDate.setYear(tempDate.getFullYear() - 1);
        }

        let msDate = tempDate.valueOf();
        let timeFiltered = [];

        for (let key in eventsArr) {
          if (parseInt(eventsArr[key]["msDate"]) >= msDate) {
            timeFiltered.push(eventsArr[key]);
          }
        }

        eventsArr = timeFiltered;
      }

      eventsArr = orderListByParam(eventsArr, "relevancy", "DESC");

      return eventsArr;
    }
  },
  firebase: function() {
    return {
      events: {
        source: firebaseDB.ref("/events/"),
        asObject: true,
        cancelCallback: function() {
          console.log("Data pull for events failed...");
        },
        readyCallback: function() {
          console.log("Data pull and sort for events complete");
          this.eventsAreLoaded = true;
        }
      },
      tfidf: {
        source: firebaseDB.ref("/events_tfidf/"),
        asObject: true,
        cancelCallback: function() {
          console.log("Data pull for tfidf failed...");
        },
        readyCallback: function() {
          console.log("Data pull and sort for tfidf  complete");
          this.tfidfIsLoaded = true;
        }
      }
    };
  },
  template: `
    <div id="app-content" class="flex flew-row flex-wrap align-start justify-center height-fill-from-60px width-100vw space-top-40px space-bottom-40px">
      <div id="enter-content" class="width-60-percent">
        <search-bar></search-bar>

        <div class="flex flex-row flex-wrap align-center justify-start width-100-percent border-bottom-2px-solid-darkest space-bottom-40px">
          <h3 class="section-label bold-text color-text-darkest space-right-40px">Found Meetings for: {{query}}</h3>

          <div class="space-left-20px dropdown-container">
            <h4 class="gapped-text display-inline-block">Allowed Bodies:</h4>
            <select class="dropdown display-inline-block width-20-percent gapped-text space-left-10px" v-model="selectedBody">
              <option v-for="body in dropdownBodies">{{body}}</option>
            </select>
          </div>

          <div class="space-left-20px dropdown-container">
            <h4 class="gapped-text display-inline-block">Allowed Dates:</h4>
            <select class="dropdown display-inline-block width-20-percent gapped-text space-left-10px" v-model="selectedDates">
              <option>All</option>
              <option>One Week</option>
              <option>One Month</option>
              <option>Three Months</option>
              <option>One Year</option>
            </select>
          </div>

          <div class="space-left-20px dropdown-container">
            <h4 class="gapped-text display-inline-block">View:</h4>
            <select class="dropdown display-inline-block width-20-percent gapped-text space-left-10px" v-model="selectedViewN">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>

        </div>

        <div v-if="dataIsLoaded" class="width-100-percent"><event-cards-container v-if="eventsAreLoaded" v-bind:displayData="toViewEvents" v-bind:viewN="selectedViewN"></event-cards-container></div>
        <div v-else class="load-dots"></div>
      </div>
    </div>`
};

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We"ll talk about nested routes later.
const routes = [
  { path: "/",
    component: MainComponent
  },
  { path: "/search=:query",
    component: SearchComponent,
    props: true
  },
  { path: "/event=:event",
    component: EventComponent,
    props: true,
    beforeEnter: function(to, from, next) {
      // checkPathExists("/events/", to.params.event, to, from, next);
      next();
    }
  },
  { path: "*",
    redirect: "/"
  }
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let"s
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
});

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
const app = new Vue({
  router
}).$mount("#app-body");

// Now the app has started!
