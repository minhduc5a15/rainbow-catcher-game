import { Howl } from 'howler';

// set volume as 0.5 for all sounds

Howler.volume(0.5);

const sounds: Record<string, Howl> = {
  rain: new Howl({
    src: ['/sounds/rain.mp3'],
    preload: true,
    onload: () => {
      console.log('Rain sound loaded');
    },
  }),

  bonk: new Howl({
    src: ['/sounds/bonk.mp3'],
    preload: true,
    volume: 1,
    onload: () => {
      console.log('Bonk sound loaded');
    },
  }),

  normalDrop: new Howl({
    src: ['/sounds/normal-drop.mp3'],
    preload: true,
    onload: () => {
      console.log('Normal drop sound loaded');
    },
  }),

  frozenDrop: new Howl({
    src: ['/sounds/frozen-drop.mp3'],
    preload: true,
    onload: () => {
      console.log('Frozen drop sound loaded');
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
};
