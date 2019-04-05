<template>
  <div id="app">
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
      <label title="Words per page" class="select app-control">
        <select v-model="perPage">
          <option
            v-for="n in [10, 40, 100, 200, 400, 1000]"
            :value="n"
            :key="n"
            >{{ n }}</option
          >
        </select>
      </label>
      <label title="Filter by lang" class="select app-control">
        <select :value="currentLang" @input="selectLang">
          <option value="">All</option>
          <option v-for="i18n in $options.i18n" :value="i18n" :key="i18n">{{
            i18n
          }}</option>
        </select>
      </label>
      <label title="Search" class="app-expand app-control">
        <input
          class="input"
          type="search"
          :value="textFilter"
          @input="inputFilter"
          placeholder="search"
        />
      </label>
    </div>
    <table
      class="app-table table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
      v-show="paginatedData.length"
    >
      <thead>
        <tr>
          <th class="app-col-audio has-text-centered">&#9835;</th>
          <th v-for="i18n in $options.i18n" :key="i18n">{{ i18n }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedData" :key="item.id">
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
  cacheLod: "lodData",
  sourceLod: "https://rentringer.gitlab.io/lod-rest",
  data: function() {
    return {
      textFilter: "",
      lod: [],
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
    savedData() {
      localStorage.setItem(this.$options.cacheLod, JSON.stringify(this.lod));
    },
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
    }
  }
};
</script>

<style lang="css">
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
.app-col-audio {
  width: 35px;
}
.app-pg-count {
  min-width: 100px;
}
.app-table td {
  vertical-align: middle;
}
</style>
