import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePreferencesStore } from '../preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    usePreferencesStore.setState({
      preferences: {
        theme: 'warm',
        fontSize: 'medium',
        language: 'zh-CN',
      },
    });
  });

  it('应该具有默认偏好设置', () => {
    const state = usePreferencesStore.getState();

    expect(state.preferences.theme).toBe('warm');
    expect(state.preferences.fontSize).toBe('medium');
    expect(state.preferences.language).toBe('zh-CN');
  });

  it('应该能更新主题偏好', () => {
    const { setPreference } = usePreferencesStore.getState();

    setPreference('theme', 'dark');

    const newState = usePreferencesStore.getState();
    expect(newState.preferences.theme).toBe('dark');
  });

  it('应该能更新字体大小偏好', () => {
    const { setPreference } = usePreferencesStore.getState();

    setPreference('fontSize', 'large');

    const newState = usePreferencesStore.getState();
    expect(newState.preferences.fontSize).toBe('large');
  });

  it('应该能更新语言偏好', () => {
    const { setPreference } = usePreferencesStore.getState();

    setPreference('language', 'en');

    const newState = usePreferencesStore.getState();
    expect(newState.preferences.language).toBe('en');
  });

  it('应该拒绝无效的主题值', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { setPreference } = usePreferencesStore.getState();

    // @ts-expect-error 测试无效值
    setPreference('theme', 'invalid-theme');

    const newState = usePreferencesStore.getState();
    // 应该保持原值
    expect(newState.preferences.theme).toBe('warm');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('应该能重置为默认设置', () => {
    const { setPreference, resetPreferences } = usePreferencesStore.getState();

    // 先修改一些设置
    setPreference('theme', 'dark');
    setPreference('fontSize', 'small');

    // 重置
    resetPreferences();

    const newState = usePreferencesStore.getState();
    expect(newState.preferences.theme).toBe('warm');
    expect(newState.preferences.fontSize).toBe('medium');
    expect(newState.preferences.language).toBe('zh-CN');
  });
});
