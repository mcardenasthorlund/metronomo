function captureAudioAndGetFrequency() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const audioContext = new AudioContext();
          const mediaStreamSource = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
  
          mediaStreamSource.connect(analyser);
          analyser.fftSize = 2048;
  
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
  
          function getFrequency() {
            analyser.getByteFrequencyData(dataArray);
            const maxValue = Math.max(...dataArray);
            const maxIndex = dataArray.indexOf(maxValue);
            const frequency = audioContext.sampleRate / (maxIndex + 1);
            resolve(frequency);
          }
  
          const intervalId = setInterval(getFrequency, 100);
  
          stream.getTracks().forEach((track) => track.stop());
          audioContext.close();
          clearInterval(intervalId);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

//   captureAudioAndGetFrequency()
//   .then((frequency) => {
//     console.log(`The frequency of the sound is: ${frequency} Hz`);
//   })
//   .catch((error) => {
//     console.error('Error capturing audio:', error);
//   });