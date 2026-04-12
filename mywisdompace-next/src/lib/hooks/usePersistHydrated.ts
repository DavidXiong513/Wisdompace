import { useSyncExternalStore } from 'react';

type PersistStore = {
  persist: {
    hasHydrated: () => boolean;
    onHydrate: (listener: () => void) => () => void;
    onFinishHydration: (listener: () => void) => () => void;
  };
};

export function usePersistHydrated<TStore extends PersistStore>(store: TStore) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const unsubscribeHydrate = store.persist.onHydrate(onStoreChange);
      const unsubscribeFinish = store.persist.onFinishHydration(onStoreChange);

      return () => {
        unsubscribeHydrate();
        unsubscribeFinish();
      };
    },
    () => store.persist.hasHydrated(),
    () => false
  );
}
