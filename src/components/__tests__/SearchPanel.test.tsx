import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchPanel } from '../SearchPanel';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'search.placeholder': '搜索章节内容...',
      'search.button': '搜索',
      'search.noResults': '未找到结果',
    };
    return translations[key] || key;
  },
}));

const mockOnClose = vi.fn();

describe('SearchPanel', () => {
  it('renders search input when open', () => {
    render(<SearchPanel open={true} onClose={mockOnClose} />);

    expect(screen.getByPlaceholderText('检索全站（占位实现：基于本地数据）')).toBeInTheDocument();
    expect(screen.getByText('关闭')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SearchPanel open={false} onClose={mockOnClose} />);

    expect(screen.queryByPlaceholderText('检索全站（占位实现：基于本地数据）')).not.toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<SearchPanel open={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('检索全站（占位实现：基于本地数据）');
    fireEvent.change(input, { target: { value: '人生意义' } });

    expect(input).toHaveValue('人生意义');
  });

  it('shows error for long input', () => {
    render(<SearchPanel open={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('检索全站（占位实现：基于本地数据）');
    fireEvent.change(input, { target: { value: 'a'.repeat(101) } });

    expect(screen.getByText('搜索内容不能超过100个字符')).toBeInTheDocument();
  });
});
