const audio = {
  play(elem) {
    elem.load()
  },
  getAudio(url) {
    let audio = document.createElement('audio');
    audio.src = url;
    audio.autoplay = true;
    audio.load()
    
    return audio
  },
}

audio.HINT = audio.getAudio("audio/mixkit-interface-hint-notification-911.wav");
audio.CLICK = audio.getAudio("audio/mixkit-sci-fi-click-900.wav");
audio.CONFIRM = audio.getAudio("audio/mixkit-sci-fi-confirmation-914.wav");