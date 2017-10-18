// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter
// and then call `Vue.use(VueRouter)`.

// 1. Define route components.
// These can be imported from other files
const MainComponent = {
  template: `
    <div id="app-content" class="flex flew-row flex-wrap align-start justify-center height-fill-from-60px width-100vw space-top-40px space-bottom-40px">
      <div id="enter-content" class="width-60-percent">
        <input id="app-search" class="border-none border-bottom-2px-solid-darkest color-text-darkest gapped-text width-fill-from-20px padding-left-20px space-bottom-40px" type="text" placeholder="Search events..." tabindex="0" onkeypress="handleSearch(event)" />

        <h3 class="section-label bold-text color-text-darkest space-bottom-40px border-bottom-2px-solid-darkest">Recent Meetings</h3>
        <div id="recent-content" class="flex flex-row flex-wrap align-center justify-start width-100-percent">

        </div>

        <h3 class="section-label bold-text color-text-darkest space-bottom-40px border-bottom-2px-solid-darkest">Need Validation</h3>
        <div id="to-validate-content" class="flex flex-row flex-wrap align-center justify-start width-100-percent">

        </div>
      </div>
    </div>`,
  mounted: function() { eventObjectsHandler(firebaseDB, '/events/', cleanEventsInfoJSON, createEventObjects, {'target': '#recent-content', 'widthOfElements': 340, 'rows': 3, 'max': 6}, true, false) }
};

const SearchComponent = {
  props: ['query'],
  template: `
    <div id="app-content" class="flex flew-row flex-wrap align-start justify-center height-fill-from-60px width-100vw space-top-40px space-bottom-40px">
      <div id="enter-content" class="width-60-percent">
        <input id="app-search" class="border-none border-bottom-2px-solid-darkest color-text-darkest gapped-text width-fill-from-20px padding-left-20px space-bottom-40px" type="text" placeholder="Search events..." tabindex="0" onkeypress="handleSearch(event)" />

        <h3 class="section-label bold-text color-text-darkest space-bottom-40px border-bottom-2px-solid-darkest">Found Meetings for: '{{ query }}'</h3>
        <div id="search-content" class="flex flex-row flex-wrap align-center justify-start width-100-percent">

        </div>
      </div>
    </div>`,
    mounted: function() { searchPageHandler(this._props.query, firebaseDB, '/events/', cleanEventsInfoJSON, createEventObjects, {'target': '#search-content', 'widthOfElements': '100%', 'rows': 20, 'max': 20}, true, false) }
};

const EventComponent = {
  props: ['id'],
  template: `<p>event: {{ id }}</p>`,
  mounted: function() { eventPageHandler(this._props.id, true) }
};

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: MainComponent },
  { path: '/search=:query', component: SearchComponent, props: true },
  { path: '/event=:id', component: EventComponent, props: true },
  { path: '*', redirect: '/' }
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
});

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
const app = new Vue({
  router
}).$mount('#app-body');

// Now the app has started!
