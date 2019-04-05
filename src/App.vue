<template>
  <div id="app" @dragover.prevent @drop.prevent>
    <div class="app-top">
      <div class="app-control">
        <div class="buttons has-addons">
          <button
            class="button has-text-link"
            :disabled="pageNumber == 0"
            @click="pageNumber = 0"
          >
            &#171;
          </button>
          <button
            class="button has-text-link"
            :disabled="pageNumber == 0"
            @click="pageNumber--"
          >
            &#8249;
          </button>
          <button class="button app-pg-count is-static">{{ infoPages }}</button>
          <button
            class="button has-text-link"
            :disabled="pageNumber == pageCount"
            @click="pageNumber++"
          >
            &#8250;
          </button>
          <button
            class="button has-text-link"
            :disabled="pageNumber == pageCount"
            @click="pageNumber = pageCount"
          >
            &#187;
          </button>
        </div>
      </div>
      <label class="select app-control">
        <select v-model="perPage">
          <option
            v-for="n in [10, 40, 100, 200, 400, 1000]"
            :value="n"
            :key="n"
            >{{ n }}</option
          >
        </select>
      </label>
      <label class="select app-control">
        <select v-bind:value="currentLang" @input="selectLang">
          <option value="">All</option>
          <option v-for="i18n in $options.i18n" :value="i18n" :key="i18n">{{
            i18n
          }}</option>
        </select>
      </label>
      <label class="app-expand app-control">
        <input
          class="input"
          type="search"
          :value="textFilter"
          @input="inputFilter"
          placeholder="search"
        />
      </label>
      <button
        @click="filterBySelected"
        :disabled="!lodSelected.length"
        class="button app-control"
        :class="{ 'is-active has-background-light': selectedFilter }"
      >
        {{ lodSelected.length }} / {{ totalFiltered }}
      </button>
      <label class="button is-warning app-control"
        >Import
        <input
          hidden
          type="file"
          multiple
          accept="application/json"
          @change="importJson"
        />
      </label>
      <button
        :disabled="!lodSelected.length"
        type="button"
        class="button app-control is-primary"
        @click="exportJson(false)"
      >
        Export
      </button>
      <button
        :disabled="!lodSelected.length"
        type="button"
        class="button app-control is-link"
        @click="exportJson(true)"
      >
        Publish
      </button>
      <button
        type="button"
        class="button is-danger app-control"
        @click="clearData"
      >
        Clear
      </button>
    </div>
    <table
      class="app-table table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
      v-show="paginatedData.length"
    >
      <thead>
        <tr>
          <th class="app-col-checkbox has-text-centered">
            <input ref="inputCheckAll" @click="checkAll" type="checkbox" />
          </th>
          <th class="app-col-img has-text-centered">&#9786;</th>
          <th class="app-col-audio has-text-centered">&#9835;</th>
          <th v-for="i18n in $options.i18n" :key="i18n">{{ i18n }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedData" :key="item">
          <td class="has-text-centered">
            <input type="checkbox" v-model="lodSelected" :value="item.id" />
          </td>
          <td class="has-text-centered is-unselectable">
            <label @drop="saveImage" :data-id="item.id">
              <img
                @dragleave.prevent="removeImage"
                class="app-thumbnail"
                v-if="item.img"
                :src="'data:image/svg+xml;utf8;base64,' + item.img"
              />
              <a v-else class="app-bt-upload-img">&#9786;</a>
              <input
                hidden
                type="file"
                accept="image/svg+xml"
                @input="saveImage"
              />
            </label>
          </td>
          <td class="app-cell-audio has-text-centered is-unselectable">
            <a @click="playAudio(item.id)">&#9835;</a>
          </td>
          <td v-for="i18n in $options.i18n" :key="i18n">
            {{ item[i18n] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import "bulma";
import "normalize.css";
export default {
  name: "App",
  i18n: ["lu", "fr", "de", "en", "pt"],
  cacheSelected: "lodSelected",
  cacheLod: "lodData",
  sourceLod: "https://rentringer.gitlab.io/lod-rest",
  data: function() {
    return {
      textFilter: "",
      lod: [],
      lodSelected: [],
      currentLang: "lu",
      pageNumber: 0,
      pageNumberOld: 0,
      perPage: 40,
      selectedFilter: false
    };
  },
  created() {
    const lod = JSON.parse(localStorage.getItem(this.$options.cacheLod));
    if (lod) this.lod = lod;
    else
      axios
        .get(this.$options.sourceLod + "/data/lod.json")
        .then(({ data: lod }) => (this.lod = lod))
        .then(() => this.savedData());
    this.lodSelected =
      JSON.parse(localStorage.getItem(this.$options.cacheSelected)) || [];
  },
  watch: {
    lodSelected(val) {
      if (val.length) {
        localStorage.setItem(this.$options.cacheSelected, JSON.stringify(val));
      } else {
        localStorage.removeItem(this.$options.cacheSelected);
        this.selectedFilter = false;
      }
    },
    paginatedData() {
      this.$refs.inputCheckAll.checked = false;
    }
  },
  computed: {
    audioElement: () => new Audio(),
    filteredItems() {
      const filter = this.textFilter;
      const lang = this.currentLang;
      const condition = text =>
        text ? text.toLowerCase().includes(filter.toLowerCase()) : false;
      const all = i => this.$options.i18n.filter(l => condition(i[l]));
      return this.lod.filter(i => {
        if (this.selectedFilter)
          return (
            this.lodSelected.includes(i.id) &&
            (lang ? condition(i[lang]) : all(i).length > 0)
          );
        if (lang) return condition(i[lang]);
        return all(i).length > 0;
      });
    },
    totalFiltered() {
      return this.filteredItems.length;
    },
    pageCount() {
      const total = this.totalFiltered;
      const perPage = this.perPage;
      const pages = Math.floor(total / perPage);
      return total && perPage * pages == total ? pages - 1 : pages;
    },
    paginatedData() {
      const start = this.pageNumber * this.perPage;
      const end = start + this.perPage;
      return this.filteredItems.slice(start, end);
    },
    infoPages() {
      const i = this.totalFiltered ? 1 : 0;
      const page = this.pageNumber + i;
      const count = this.pageCount + i;
      return String(page).padStart(String(count).length, "0") + " / " + count;
    }
  },
  methods: {
    playAudio(id) {
      const index = this.lod.findIndex(i => i.id == id);
      this.audioElement.src =
        "audio" in this.lod[index]
          ? "data:audio/mpeg;base64," + this.lod[index].audio
          : this.$options.sourceLod + "/audio/" + id + ".mp3";
      this.audioElement.addEventListener("canplaythrough", () =>
        this.audioElement.play()
      );
    },
    resetPageNumber() {
      this.pageNumber = 0;
    },
    selectLang(e) {
      this.resetPageNumber();
      this.currentLang = e.target.value;
    },
    inputFilter(e) {
      this.resetPageNumber();
      this.textFilter = e.target.value.trim();
    },
    filterBySelected() {
      this.resetPageNumber();
      this.textFilter = "";
      this.currentLang = "lu";
      this.selectedFilter = !this.selectedFilter;
    },
    checkAll(e) {
      if (e.target.checked) {
        this.paginatedData.map(i =>
          this.lodSelected.indexOf(i.id) === -1
            ? this.lodSelected.push(i.id)
            : ""
        );
      } else {
        for (let item of this.paginatedData)
          this.lodSelected = this.lodSelected.filter(id => id != item.id);
      }
    },
    clearData() {
      this.lod = this.lodSelected = [];
      this.textFilter = "";
      this.resetPageNumber();
      localStorage.clear();
    },
    savedData() {
      localStorage.setItem(this.$options.cacheLod, JSON.stringify(this.lod));
    },
    getFormattedTime() {
      var today = new Date();
      var y = today.getFullYear();
      var m = today.getMonth();
      var d = today.getDate();
      var h = today.getHours();
      var mn = today.getMinutes();
      var s = today.getSeconds();
      var t = today.getTime();
      return d + "-" + m + "-" + y + "-" + h + "_" + mn + "_" + s + "-" + t;
    },
    createFile(data = "", filename = "data.json", type = "application/json") {
      data = JSON.stringify(data);
      const file = new Blob([data], { type });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(file);
    },
    exportJson(single = true) {
      const lod = this.lod.filter(i => this.lodSelected.includes(i.id));
      const total = lod.length - 1;
      lod.forEach((item, i) => {
        axios
          .get(this.$options.sourceLod + "/audio/" + item.id + ".mp3", {
            responseType: "blob"
          })
          .then(({ data: mp3 }) => {
            const reader = new FileReader();
            reader.readAsDataURL(mp3);
            reader.onload = () => {
              lod[i].audio = reader.result.split(",")[1];
              if (single === true) this.createFile(lod[i], i + 1 + ".json");
              else if (i === total)
                this.createFile(
                  lod,
                  "lod-export-" + this.getFormattedTime() + ".json"
                );
            };
          });
      });
    },
    importJson(e) {
      const file = e.target.files && e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        this.clearData();
        let result = JSON.parse(event.target.result) || [];
        this.lod = Array.isArray(result) ? result : new Array(result);
        this.savedData();
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    removeImage(e) {
      if (!confirm("Delete img ?")) return;
      const id = e.target.parentNode.getAttribute("data-id");
      const index = this.lod.findIndex(i => i.id == id);
      this.$delete(this.lod[index], "img");
      this.savedData();
    },
    saveImage(e) {
      event.stopPropagation();
      event.preventDefault();
      const file =
        (e.target.files && e.target.files[0]) || e.dataTransfer.files[0];
      if (!file || file.type != "image/svg+xml") return;
      const id = e.target.parentNode.getAttribute("data-id");
      const reader = new FileReader();
      reader.onload = event => {
        const imgbase64 = event.target.result.split(",")[1];
        const index = this.lod.findIndex(i => i.id == id);
        this.$set(this.lod[index], "img", imgbase64);
        this.savedData();
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  }
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 70px 10px 10px 10px;
}
.app-top {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
  background: #fff;
  z-index: 99;
}

.app-bt-upload-img {
  display: block;
}

.app-control {
  margin: 0 5px;
}

.app-expand {
  flex: 1;
  min-width: 100px;
}

.app-table {
  table-layout: fixed;
}

.app-col-checkbox,
.app-col-audio {
  width: 35px;
}

.app-col-img {
  width: 45px;
}

.app-pg-count {
  min-width: 100px;
}

.app-table td,
.app-thumbnail {
  vertical-align: middle;
}
</style>
