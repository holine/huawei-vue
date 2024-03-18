<template>
  <div class="huawei-map">
    <div class="weui-search-bar">
      <form
        role="combobox"
        aria-haspopup="true"
        aria-expanded="false"
        aria-owns="searchResult"
        class="weui-search-bar__form"
      >
        <div class="weui-search-bar__box">
          <i class="weui-icon-search" />
          <input
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
          @click="seaching = true"
        >
          <i class="weui-icon-search"></i>
          <span aria-hidden="true">搜索地点</span>
        </label>
      </form>
      <a
        v-if="seaching"
        href="javascript:"
        role="button"
        class="weui-search-bar__cancel-btn"
        wah-hotarea="click"
        style="display: block"
        @click="seaching = false"
      >
        取消
      </a>
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
          location = item.location;
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
import "weui";
import Debounce from "./debounce";
import position from "../assets/position.png";
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
    defaultLocation: {
      type: Object,
      default: () => ({
        lng: 116.39764,
        lat: 39.90639,
      }),
    },
  },
  data() {
    return {
      map: null,
      seaching: false,
      keyword: "",
      timer: null,
      marker: null,
      location: null,
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
          this.location = location;
          this.reverseGeocode(location).then((result) => {
            this.locationData = [result];
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
    }).then(() =>
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
                    center: this.defaultLocation,
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
                this.centerChanged.run(
                  window.HWMapJsSDK.HWMapUtils.epsgToLatLng(coordinate)
                )
              );
              this.map.on("pointerup", () =>
                this.centerChanged.run(this.map.getCenter())
              );
              resolve();
            }),
            this.getCurrentPosition(),
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
      if (this.locationData.length) {
        if (this.currentLocationData.length) {
          return (
            this.locationData[0].siteId === this.currentLocationData[0].siteId
          );
        } else {
          return false;
        }
      } else {
        return true;
      }
    },
    data() {
      if (this.location) {
        return this.locationData.concat(
          this.nearbySearchData.filter((item) => {
            return this.locationData.every((i) => i.siteId !== item.siteId);
          })
        );
      } else if (this.currentLocation) {
        return this.currentLocationData.concat(
          this.nearbySearchData.filter((item) => {
            return this.currentLocationData.every(
              (i) => i.siteId !== item.siteId
            );
          })
        );
      } else {
        return this.nearbySearchData;
      }
    },
    searchByText() {
      return {
        Location: this.location,
        currentLocation: this.currentLocation,
        defaultLocation: this.defaultLocation,
        location: this.currentLocation || this.location || this.defaultLocation,
        query: this.keyword.trim(),
        pageIndex: this.searchByTextPage,
      };
    },
    nearbySearch() {
      return {
        Location: this.location,
        currentLocation: this.currentLocation,
        defaultLocation: this.defaultLocation,
        location: this.currentLocation || this.location || this.defaultLocation,
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
    getCurrentPositionManual() {
      this.getCurrentPosition().then(() => {
        this.map.setCenter(this.currentLocation);
        this.$refs.map.parentElement.classList.add("bounceInDown");
        setTimeout(() => {
          this.$refs.map.parentElement.classList.remove("bounceInDown");
        }, 800);
      }, console.error);
    },
    getCurrentPosition() {
      return new Promise((resolve) =>
        window.navigator.geolocation.getCurrentPosition(
          ({ coords }) =>
            this.reverseGeocode(
              window.HWMapJsSDK.HWCoordinateConverter.convert([
                {
                  lat: coords.latitude,
                  lng: coords.longitude,
                },
              ])[0]
            )
              .then((result) => {
                this.currentLocation = result.location;
                this.currentLocationData = [
                  {
                    ...result,
                    name: "我的位置",
                  },
                ];
                if (this.marker) {
                  this.marker.setPosition(this.currentLocation);
                } else {
                  this.marker = new HWMapJsSDK.HWMarker({
                    map: this.map,
                    position: this.currentLocation,
                    zIndex: 10,
                    icon: {
                      anchor: [0.5, 0.5],
                      scale: 0.5,
                      url: position,
                    },
                  });
                }
              })
              .catch(() => {
                this.currentLocation = {
                  lat: coords.latitude,
                  lng: coords.longitude,
                };
                this.currentLocationData = [];
                this.marker.setMap(null);
                this.marker = null;
              })
              .finally(() => {
                this.location = null;
                this.locationData = [];
                resolve();
              }),
          resolve,
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
              resolve(result.sites[0]);
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
@import url("./index.css");

:deep(.hwmap-controls-container-L) {
  display: none !important;
}
</style>
