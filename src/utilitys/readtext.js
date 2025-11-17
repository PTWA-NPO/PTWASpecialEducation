let voices = [];
let selectedVoice = null;
// let synth = window.speechSynthesis
export function InitReadProccess() {
  const synth = window.speechSynthesis;
  const voicetype_order = [
    "Microsoft HsiaoChen Online (Natural) - Chinese (Taiwan)",
    "Google 國語（臺灣）",
  ];
  synth.onvoiceschanged = () => {
    voices = synth.getVoices();
    selectedVoice = voices[0];
    selectedVoice = findlang(voicetype_order[0]);
    if (selectedVoice == null) {
      selectedVoice = findlang(voicetype_order[1]);
    }
  };
}
export function findlang(lang) {
  for (let i = 0; i < voices.length; i++) {
    try {
      if (voices[i].name === lang) {
        return voices[i];
      }
    } catch {
      // 忽略語音相關錯誤
    }
  }
  return null;
}
export function ReadText(text, stop = false) {
  if (stop) {
    // If Get time, Fix this
    const synth = window.speechSynthesis;
    synth.cancel();
    return 0;
  } else {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.voice = selectedVoice;
      synth.speak(utterThis);
    } catch (error) {
      console.warn("語音播放失敗:", error.message);
      // 可以選擇是否要向用戶顯示錯誤訊息
    }
  }
}
export function StopRead() {
  const synth = window.speechSynthesis;
  synth.cancel();
}
