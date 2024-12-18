<template>
  <div>
    <h1>Supported Speech Synthesis Voices</h1>
    <button @click="speak">
      Speak
    </button>
    <ul>
      <li v-for="(voice, index) in voices" :key="index">
        {{ index + 1 }}: {{ voice.name }} ({{ voice.lang }}) -
        {{ voice.default ? "Default" : "" }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      voices: [],
    };
  },
  mounted() {
    // Attach the populate function to the voiceschanged event
    speechSynthesis.onvoiceschanged = this.populateVoiceList;
    // Also call it immediately in case voices are already available
    this.populateVoiceList();
  },
  methods: {
    speak() {
      let synth = window.speechSynthesis;
      synth.cancel();
      synth.lang = "zh-TW";
      let utterThis = new SpeechSynthesisUtterance(
        "東漢末年，漢廷因黃巾之亂、北宮伯玉之亂、黑山軍起義、王芬謀廢靈帝、張舉張純叛亂、外戚宦官火拼等一系列事件而動盪不安。184年漢靈帝時期，以張角三兄弟為首爆發黃巾之亂"
      );
      utterThis.voice = synth.getVoices()[157];
      synth.speak(utterThis);

      // 可用
      // Microsoft Yating - Chinese (Traditional, Taiwan)
    },
    populateVoiceList() {
      this.voices = speechSynthesis.getVoices();
      for (let i = 0; i < this.voices.length; i++) {
        console.log(this.voices[i].name);
        if (this.voices[i].name == "Google 國語（臺灣）") {
          // alert('找到',this.voices[i]);
          break;
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 8px;
  font-size: 18px;
}
</style>
