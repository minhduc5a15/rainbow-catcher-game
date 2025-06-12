import { Howl } from 'howler';

const sounds: Record<string, Howl> = {
  rain: new Howl({
    src: ['/sounds/rain.mp3'],
    preload: true,
    onload: () => {
      console.log('Rain sound loaded');
    },
  }),
};

export const playSound = (name: string) => {
  try {
    if (sounds[name]) {
      sounds[name].play();
    } else {
      console.warn(`Sound "${name}" not found`);
    }
  } catch (error) {
    console.error(`Error playing sound "${name}":`, error);
  }
};
export const stopSound = (name: string) => {
  try {
    if (sounds[name]) {
      sounds[name].stop();
    } else {
      console.warn(`Sound "${name}" not found`);
    }
  } catch (error) {
    console.error(`Error stopping sound "${name}":`, error);
  }
};

export const stopAllSounds = () => {
  try {
    Object.values(sounds).forEach((sound) => sound.stop());
  } catch (error) {
    console.error('Error stopping all sounds:', error);
  }
}
