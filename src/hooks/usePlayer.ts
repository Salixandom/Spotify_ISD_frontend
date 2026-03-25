import { usePlayerStore } from '../store/playerStore';

export const usePlayer = () => {
  const store = usePlayerStore();
  return store;
};
