'use no memo';

import { useState, useEffect } from 'react';

type PersistStore = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
  };
};

/**
 * 检测 Zustand persist 中间件是否已完成 hydration。
 *
 * 使用 useState + useEffect 替代 useSyncExternalStore，避免 React 19
 * hydration mismatch 导致组件卡在 loading 状态的问题。
 *
 * 'use no memo' — 告知 React Compiler 不要优化此 hook，
 * 因为 setState 在 effect 中是必要的（等待外部存储 hydration 完成后再更新渲染）。
 */
export function usePersistHydrated<TStore extends PersistStore>(store: TStore) {
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return store.persist.hasHydrated();
  });

  useEffect(() => {
    if (store.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsub = store.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // 安全回退：最长等待 3 秒，防止某些异常情况下无限 loading
    const timer = setTimeout(() => {
      if (!store.persist.hasHydrated()) {
        console.warn(
          `[usePersistHydrated] Store hydration timeout, forcing hydrated=true`
        );
      }
      setHydrated(true);
    }, 3000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [store]);

  return hydrated;
}
