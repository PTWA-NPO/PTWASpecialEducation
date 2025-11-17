import { Howl } from "howler";

// 錯誤消息常量
const ERROR_SOUND_NOT_REGISTERED = "音效未註冊！";

class SoundManager {
  constructor() {
    this.sounds = {}; // 儲存音效
    this.queue = []; // 音效排程
    this.isPlaying = false; // 追蹤是否正在播放
    this.initSounds(); // 初始化音效
  }

  initSounds() {
    // 可在此處添加預設音效註冊邏輯
  }

  // 註冊音效並預載入
  registerSound(name, src, isStream = false) {
    if (!this.sounds[name]) {
      this.sounds[name] = new Howl({
        src: [src],
        preload: true,
        html5: isStream, // 對大型音檔啟用流式播放
      });
    }
  }

  // 獲取註冊的音效
  getRegisteredSound(name) {
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`${ERROR_SOUND_NOT_REGISTERED} ${name}`);
    }
    return sound;
  }

  playSoundImmediately(name) {
    const sound = this.getRegisteredSound(name);
    if (!sound) return;

    this.playImmediately(sound);
  }

  playImmediately(sound) {
    this.isPlaying = true;
    const id = sound.play();
    if (id === null) {
      console.error("音效播放失敗！");
      return;
    }

    sound.once("end", () => {
      this.isPlaying = false;
      this.processQueue(); // 播放下一個音效
    });
  }

  playSoundLoop(name) {
    const sound = this.getRegisteredSound(name);
    if (!sound) return;

    sound.loop(true); // 啟用循環
    this.playImmediately(sound);
  }

  // 將音效加入排程
  scheduleSoundPlayback(name) {
    const sound = this.getRegisteredSound(name);
    if (!sound) return;

    this.queue.push(sound);
    this.processQueue();
  }

  // 處理排程中的音效
  processQueue() {
    if (this.isPlaying || this.queue.length === 0) return;

    const nextSound = this.queue.shift();
    this.playImmediately(nextSound);
  }

  // 停止所有音效
  stopAllSounds() {
    for (const name in this.sounds) {
      this.stopSound(this.sounds[name]);
    }
    this.resetState();
  }

  // 停止單個音效
  stopSound(sound) {
    sound.loop(false); // 確保循環播放設置為 false
    sound.stop(); // 停止播放
  }

  // 重置播放狀態
  resetState() {
    this.isPlaying = false; // 重置播放狀態
    this.queue = []; // 清空排程
  }
}

export const soundManager = new SoundManager();
