<template>
  <div class="huawei-map">
    <div v-if="isMode('search')" class="weui-search-bar">
      <form
        ref="searchForm"
        role="combobox"
        aria-haspopup="true"
        aria-expanded="false"
        aria-owns="searchResult"
        class="weui-search-bar__form"
        @submit.prevent="$refs.searchInput.blur()"
        action="javascript:void(0);"
      >
        <div class="weui-search-bar__box">
          <i class="weui-icon-search" />
          <input
            ref="searchInput"
            type="search"
            aria-controls="searchResult"
            class="weui-search-bar__input"
            placeholder="搜索地点"
            required=""
            v-model="keyword"
          />
          <a
            v-if="keyword.trim() !== ''"
            href="javascript:"
            role="button"
            title="清除"
            class="weui-icon-clear"
            wah-hotarea="click"
            @click="keyword = ''"
          ></a>
        </div>
        <label
          v-if="!seaching"
          for="searchInput"
          class="weui-search-bar__label"
          wah-hotarea="click"
          style="transform-origin: 0px 0px; opacity: 1; transform: scale(1, 1)"
          @click="
            seaching = true;
            $refs.searchInput.focus();
          "
        >
          <i class="weui-icon-search"></i>
          <span aria-hidden="true">搜索地点</span>
        </label>
      </form>
      <template v-if="seaching">
        <a
          v-if="keyword.length"
          href="javascript:"
          role="button"
          class="weui-search-bar__cancel-btn"
          wah-hotarea="click"
          style="display: block"
          @click="$refs.searchForm.submit()"
        >
          搜索
        </a>
        <a
          v-else
          href="javascript:"
          role="button"
          class="weui-search-bar__cancel-btn"
          wah-hotarea="click"
          style="display: block"
          @click="seaching = false"
        >
          取消
        </a>
      </template>
    </div>
    <div v-else-if="isMode('search-manual')" class="weui-search-bar">
      <form
        ref="searchManualForm"
        role="combobox"
        aria-haspopup="true"
        aria-expanded="false"
        aria-owns="searchResult"
        class="weui-search-bar__form"
        @submit.prevent="$refs.searchInput.blur();keyword = Keyword"
        action="javascript:void(0);"
      >
        <div class="weui-search-bar__box">
          <i class="weui-icon-search" />
          <input
            ref="searchInput"
            type="search"
            aria-controls="searchResult"
            class="weui-search-bar__input"
            placeholder="搜索地点"
            required=""
            v-model="Keyword"
          />
          <a
            v-if="Keyword.trim() !== ''"
            href="javascript:"
            role="button"
            title="清除"
            class="weui-icon-clear"
            wah-hotarea="click"
            @click="Keyword = ''"
          ></a>
        </div>
        <label
          v-if="!seaching"
          for="searchInput"
          class="weui-search-bar__label"
          wah-hotarea="click"
          style="transform-origin: 0px 0px; opacity: 1; transform: scale(1, 1)"
          @click="
            seaching = true;
            $refs.searchInput.focus();
          "
        >
          <i class="weui-icon-search"></i>
          <span aria-hidden="true">搜索地点</span>
        </label>
      </form>
      <template v-if="seaching">
        <a
          v-if="Keyword.length"
          href="javascript:"
          role="button"
          class="weui-search-bar__cancel-btn"
          wah-hotarea="click"
          style="display: block"
          @click="$refs.searchManualForm.submit()"
        >
          搜索
        </a>
        <a
          v-else
          href="javascript:"
          role="button"
          class="weui-search-bar__cancel-btn"
          wah-hotarea="click"
          style="display: block"
          @click="seaching = false"
        >
          取消
        </a>
      </template>
    </div>
    <div
      class="map-container"
      :class="{
        'current-location': !isCurrentLocation,
      }"
    >
      <div ref="map" />
      <div @click="getCurrentPositionManual">
        <img src="../assets/navbg.png" />
        <img src="../assets/nav.png" />
      </div>
    </div>
    <div class="weui-cells" @scroll="nearbySearchScroll">
      <div
        v-for="item in data"
        class="weui-cell weui-cell_active"
        role="menuitem"
        data-id="article"
        href="javascript:"
        tabindex="0"
        wah-hotarea="click"
        @click="$emit('location', item)"
      >
        <div class="weui-cell__bd">
          <div>
            {{ item.name }}
          </div>
          <div>
            {{ item.formatAddress }}
          </div>
        </div>
      </div>
      <div
        v-if="nearbySearchDebounce.loading()"
        class="weui-cell weui-cell_active"
        role="menuitem"
        data-id="article"
        href="javascript:"
        tabindex="0"
        wah-hotarea="click"
        style="padding-left: 0; background-image: none"
      >
        <div class="weui-loadmore" style="width: 100%; margin: 0">
          <span
            aria-hidden="true"
            role="img"
            aria-label="正在加载"
            class="weui-primary-loading"
          >
            <i class="weui-primary-loading__dot"></i>
          </span>
          <span class="weui-loadmore__tips" style="font-size: 12px">
            正在加载
          </span>
        </div>
      </div>
    </div>
    <div
      v-if="seaching"
      class="weui-cells search-result"
      @scroll="searchByTextScroll"
    >
      <div
        v-for="item in searchByTextData"
        class="weui-cell weui-cell_active"
        role="menuitem"
        data-id="article"
        href="javascript:"
        tabindex="0"
        wah-hotarea="click"
        style="align-items: flex-start"
        @click="
          map.setCenter(item.location);
          $emit('update:location', item.location);
          locationData = [item];
          seaching = false;
        "
      >
        <div class="weui-cell__bd">
          <div>
            {{ item.name }}
          </div>
          <div>
            {{ item.formatAddress }}
          </div>
        </div>
      </div>
      <div
        v-if="searchByTextDebounce.loading()"
        class="weui-cell weui-cell_active"
        role="menuitem"
        data-id="article"
        href="javascript:"
        tabindex="0"
        wah-hotarea="click"
        style="padding-left: 0; background-image: none"
      >
        <div class="weui-loadmore" style="width: 100%; margin: 0">
          <span
            aria-hidden="true"
            role="img"
            aria-label="正在加载"
            class="weui-primary-loading"
          >
            <i class="weui-primary-loading__dot"></i>
          </span>
          <span class="weui-loadmore__tips" style="font-size: 12px">
            正在加载
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Debounce from "./debounce";
import position from "../assets/position.png";
const TIANANMEN = { lng: 116.3974501246199, lat: 39.909187895034684 };
export default {
  name: "Map",
  props: {
    apiKey: {
      type: String,
      required: true,
    },
    option: {
      type: Object,
      default: () => ({}),
    },
    throttle: {
      type: Number,
      default: 300,
    },
    location: {
      type: Object,
      required: true,
    },
    mode: {
      type: [String, Array],
      default: "full",
    },
  },
  data() {
    return {
      map: null,
      seaching: false,
      keyword: "",
      Keyword: "",
      marker: null,
      locationData: [],
      currentLocation: null,
      currentLocationData: [],
      nearbySearchPage: 0,
      nearbySearchTotal: 0,
      nearbySearchData: [],
      nearbySearchDebounce: new Debounce(),
      nearbySearchPageIncrement: null,
      searchByTextPage: 0,
      searchByTextTotal: 0,
      searchByTextData: [],
      searchByTextDebounce: new Debounce(),
      searchByTextPageIncrement: null,
      centerChanged: new Debounce(),
    };
  },
  created() {
    this.centerChanged = new Debounce(
      (location) =>
        new Promise(() => {
          this.nearbySearchDebounce.cancel();
          this.nearbySearchTotal = 0;
          this.nearbySearchData = [];
          this.nearbySearchPage = 1;
          this.$emit("update:location", location);
          this.reverseGeocode(location).then((result) => {
            this.locationData = this.isMode("full") ? [result] : result;
          }, console.error);
          this.$refs.map.parentElement.classList.add("bounceInDown");
          setTimeout(() => {
            this.$refs.map.parentElement.classList.remove("bounceInDown");
          }, 800);
        }),
      this.throttle
    );
    this.searchByTextPageIncrement = new Debounce(
      () => Promise.resolve(this.searchByTextPage++),
      this.throttle
    );
    this.nearbySearchPageIncrement = new Debounce(
      () => Promise.resolve(this.nearbySearchPage++),
      this.throttle
    );
    this.nearbySearchDebounce = new Debounce(
      (data) =>
        new Promise((resolve, reject) =>
          new window.HWMapJsSDK.HWSiteService().nearbySearch(
            data,
            (data, status) =>
              status === "0" ? resolve(data) : reject({ data, status })
          )
        ),
      this.throttle
    );
    this.searchByTextDebounce = new Debounce(
      (data) =>
        new Promise((resolve, reject) =>
          new window.HWMapJsSDK.HWSiteService().searchByText(
            data,
            (data, status) =>
              status === "0" ? resolve(data) : reject({ data, status })
          )
        ),
      this.throttle
    );

    new Promise((resolve) => {
      if (window.HWMapJsSDK) {
        resolve();
      } else {
        const script = document.createElement("script");
        const callback =
          "callback" + Math.random().toString(36).replace(".", "");
        window[callback] = resolve;
        script.src =
          "https://mapapi.cloud.huawei.com/mapjs/v1/api/js?callback=" +
          callback +
          "&key=" +
          encodeURIComponent(this.apiKey);
        document.head.appendChild(script);
      }
    })
      .then(
        () =>
          new Promise((resolve) => {
            if (
              this.location.hasOwnProperty("lat") &&
              this.location.hasOwnProperty("lng")
            ) {
              resolve();
            } else {
              window.navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                  this.$emit(
                    "update:location",
                    window.HWMapJsSDK.HWCoordinateConverter.convert([
                      {
                        lat: coords.latitude,
                        lng: coords.longitude,
                      },
                    ])[0]
                  );
                  resolve();
                },
                () => {
                  this.$emit("update:location", TIANANMEN);
                  resolve();
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0,
                }
              );
            }
          })
      )
      .then(() =>
        this.$watch(
          "option",
          () => {
            Promise.all([
              new Promise((resolve) => {
                this.map = new window.HWMapJsSDK.HWMap(
                  this.$refs.map,
                  Object.assign(
                    {
                      zoom: 15,
                      center: this.location,
                      copyrightControl: false,
                      locationControl: true,
                      zoomControl: false,
                      language: "CHI",
                      sourceType: "vector",
                    },
                    this.option
                  )
                );
                this.map.setCopyrightControl(false);
                this.map.setLocationControl(true);
                this.map.on("click", ({ coordinate }) =>
                  this.map.setCenter(
                    window.HWMapJsSDK.HWMapUtils.epsgToLatLng(coordinate)
                  )
                );
                this.map.onCenterChanged(() =>
                  this.centerChanged.run(this.map.getCenter())
                );
                resolve();
              }),
              this.getCurrentPosition()
                .then(() => {
                  if (!this.isMode("full")) {
                    this.reverseGeocode(this.location)
                      .then((result) => {
                        this.currentLocationData = result;
                      })
                      .catch(() => {
                        this.currentLocationData = [];
                      });
                  }
                })
                .catch(console.error),
            ]).then(() => {
              this.nearbySearchPage = 1;
            });
          },
          { immediate: true, deep: true }
        )
      );
  },
  computed: {
    isCurrentLocation() {
      if (
        this.location &&
        this.currentLocation &&
        this.location.hasOwnProperty("lat") &&
        this.location.hasOwnProperty("lng") &&
        this.currentLocation.hasOwnProperty("lat") &&
        this.currentLocation.hasOwnProperty("lng")
      ) {
        return (
          this.location.lat === this.currentLocation.lat &&
          this.location.lng === this.currentLocation.lng
        );
      }
    },
    data() {
      if (this.isCurrentLocation) {
        return this.currentLocationData.concat(
          this.nearbySearchData.filter((item) => {
            return this.currentLocationData.every(
              (i) => i.siteId !== item.siteId
            );
          })
        );
      } else if (this.locationData.length) {
        return this.locationData.concat(
          this.nearbySearchData.filter((item) => {
            return this.locationData.every((i) => i.siteId !== item.siteId);
          })
        );
      } else {
        return this.nearbySearchData;
      }
    },
    LOCATION() {
      if (
        this.location &&
        this.location.hasOwnProperty("lat") &&
        this.location.hasOwnProperty("lng") &&
        this.location.lat !== 0 &&
        this.location.lng !== 0
      ) {
        return this.location;
      } else if (
        this.currentLocation &&
        this.currentLocation.hasOwnProperty("lat") &&
        this.currentLocation.hasOwnProperty("lng") &&
        this.currentLocation.lat !== 0 &&
        this.currentLocation.lng !== 0
      ) {
        return this.currentLocation;
      } else {
        return TIANANMEN;
      }
    },
    searchByText() {
      return {
        location: this.LOCATION,
        query: this.keyword.trim(),
        pageIndex: this.searchByTextPage,
      };
    },
    nearbySearch() {
      return {
        location: this.LOCATION,
        pageIndex: this.nearbySearchPage,
      };
    },
  },
  watch: {
    seaching() {
      this.keyword = "";
      this.searchByTextData = [];
      this.searchByTextPage = 1;
      this.searchByTextTotal = 0;
    },
    searchByText(newValue, oldValue) {
      if (
        oldValue &&
        oldValue.pageIndex === newValue.pageIndex &&
        oldValue.pageIndex !== 1
      ) {
        this.searchByTextPage = 1;
      } else {
        const { query, location, pageIndex } = newValue;
        if (
          query.length === 0 ||
          (oldValue && query !== oldValue.query) ||
          pageIndex === 1
        ) {
          this.searchByTextData = [];
          this.searchByTextTotal = 0;
        }
        if (query.length) {
          this.searchByTextDebounce
            .run({
              query,
              location,
              pageIndex,
            })
            .then(({ sites, totalCount }) => {
              this.searchByTextData = this.searchByTextData.concat(
                sites.filter((item) =>
                  this.searchByTextData.every((i) => i.siteId !== item.siteId)
                )
              );
              this.searchByTextTotal = totalCount;
            }, console.error);
        }
      }
    },
    nearbySearch(newValue, oldValue) {
      if (!this.isMode("full")) return;
      if (
        oldValue &&
        oldValue.pageIndex === newValue.pageIndex &&
        oldValue.pageIndex !== 1
      ) {
        this.nearbySearchPage = 1;
      } else {
        if (newValue.pageIndex === 1) {
          this.nearbySearchData = [];
          this.nearbySearchTotal = 0;
        }
        this.nearbySearchDebounce
          .run({
            location: newValue.location,
            pageIndex: newValue.pageIndex,
          })
          .then(({ sites, totalCount }) => {
            this.nearbySearchData = this.nearbySearchData.concat(
              sites.filter((item) =>
                this.nearbySearchData.every((i) => i.siteId !== item.siteId)
              )
            );
            this.nearbySearchTotal = totalCount;
          }, console.error);
      }
    },
  },
  methods: {
    isMode(mode) {
      if (this.mode) {
        if (Array.isArray(this.mode)) {
          return this.mode.includes("full") || this.mode.includes(mode);
        } else {
          return this.mode === "full" || this.mode === mode;
        }
      } else {
        return false;
      }
    },
    getCurrentPositionManual() {
      this.getCurrentPosition(true).then(() => {
        this.map.setCenter(this.currentLocation);
        this.$refs.map.parentElement.classList.add("bounceInDown");
        setTimeout(() => {
          this.$refs.map.parentElement.classList.remove("bounceInDown");
        }, 800);
      }, console.error);
    },
    getCurrentPosition(manual) {
      return new Promise((resolve, reject) =>
        window.navigator.geolocation.getCurrentPosition(
          ({ coords }) =>
            new Promise((resolve) => {
              const location = window.HWMapJsSDK.HWCoordinateConverter.convert([
                {
                  lat: coords.latitude,
                  lng: coords.longitude,
                },
              ])[0];
              this.$emit("update:location", location);
              this.currentLocation = location;
              if (this.marker) {
                this.marker.setPosition(location);
              } else {
                this.marker = new HWMapJsSDK.HWMarker({
                  map: this.map,
                  position: location,
                  zIndex: 10,
                  icon: {
                    anchor: [0.5, 0.5],
                    scale: 0.5,
                    url: position,
                  },
                });
              }
              if (this.isMode("full")) {
                this.reverseGeocode(location)
                  .then((result) => {
                    this.currentLocationData = this.isMode("full")
                      ? [
                          {
                            ...result,
                            name: "我的位置",
                          },
                        ]
                      : result;
                  })
                  .catch(() => {
                    this.currentLocationData = [];
                    this.marker.setMap(null);
                    this.marker = null;
                  })
                  .finally(resolve);
              } else {
                resolve();
              }
            }).finally(resolve),
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        )
      );
    },
    reverseGeocode(location) {
      return new Promise((resolve, reject) => {
        new window.HWMapJsSDK.HWSiteService().reverseGeocode(
          {
            location,
          },
          (result, status) => {
            if (status === "0" && result.sites.length > 0) {
              resolve(this.isMode("full") ? result.sites[0] : result.sites);
            } else {
              reject({ status, result });
            }
          }
        );
      });
    },
    searchByTextScroll(event) {
      const { scrollTop, clientHeight, scrollHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        if (
          this.searchByTextData.length < this.searchByTextTotal &&
          this.searchByTextDebounce.loading() === false
        ) {
          this.searchByTextPageIncrement.run();
        }
      }
    },
    nearbySearchScroll(event) {
      const { scrollTop, clientHeight, scrollHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        if (
          this.nearbySearchData.length < this.nearbySearchTotal &&
          this.nearbySearchDebounce.loading() === false
        ) {
          this.nearbySearchPageIncrement.run();
        }
      }
    },
  },
};
</script>
<style scoped>
.huawei-map {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.weui-search-bar {
  flex: 0 0 48px;
}
.weui-cells {
  margin-top: 0px;
  overflow-y: scroll;
  flex: 1;
}
.weui-cell {
  padding: 6px 0 6px 15px;
}

.weui-cell__bd > div:first-child {
  font-size: 14px;
  line-height: 27px;
  color: var(--weui-FG-0);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.weui-cell__bd > div:last-child {
  font-size: 12px;
  color: var(--weui-TAG-TEXT-BLACK);
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.map-container {
  width: 100vw;
  flex: 0 0 75vw;
  position: relative;
}
.map-container.current-location::before {
  content: "";
  display: block;
  height: 8px;
  width: 8px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999999999;
  background-image: url("../assets/plus.png");
  background-size: contain;
}
.map-container::after {
  content: "";
  display: block;
  position: absolute;
  background-image: url("../assets/marker.png");
  top: 50%;
  left: 50%;
  height: calc(73px / 2);
  width: calc(52px / 2);
  background-size: contain;
  transform: translate3d(-50%, -100%, 0);
  z-index: 999999999;
}
.map-container.bounceInDown::after {
  animation: bounceInDown 500ms;
  animation-direction: alternate;
}

.map-container > div:first-child {
  height: 100%;
  width: 100%;
}

.map-container > div:last-child {
  position: absolute;
  height: 44px;
  width: 44px;
  left: 30px;
  bottom: 30px;
  transform: translate3d(-50%, 50%, 0px);
}

.map-container > div:last-child > img {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0px);
}

.map-container > div:last-child > img:first-child {
  height: 44px;
  width: 44px;
}

.map-container > div:last-child > img:last-child {
  height: 24px;
  width: 24px;
}

@keyframes bounceInDown {
  0%,
  60%,
  75%,
  90%,
  to {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  0%,
  to {
    transform: translate3d(-50%, -100%, 0);
  }

  25% {
    transform: translate3d(-50%, calc(-10px - 100%), 0);
  }

  50% {
    transform: translate3d(-50%, calc(-100% - 20px), 0);
  }

  75% {
    transform: translate3d(-50%, calc(-100% - 10px), 0);
  }
}

.search-result {
  position: absolute;
  top: 48px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 48px);
  background-color: var(--weui-WHITE);
  overflow: hidden scroll;
  z-index: 1999999999;
}

.search-result > .weui-cell {
  padding-left: 40px;
  background: url(../assets/search.png) no-repeat 10px 10px;
  background-size: 16px 16px;
}

.search-result > .weui-cell::before {
  left: 35px;
}

:deep(.hwmap-controls-container-L) {
  display: none !important;
}
</style>
