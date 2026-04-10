import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../NavBar';

// Mock useCurrentUser
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
  setCurrentUserForDemo: vi.fn(),
}));

import { useCurrentUser } from '@/hooks/useCurrentUser';

const mockedUseCurrentUser = vi.mocked(useCurrentUser);

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login/register button when user is not logged in', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: null,
      isLoggedIn: false,
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavBar />);

    expect(screen.getByText('登录 / 注册')).toBeInTheDocument();
  });

  it('should render user info and logout button when user is logged in', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: { name: '张三', email: 'zhangsan@example.com' },
      isLoggedIn: true,
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavBar />);

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('退出')).toBeInTheDocument();
  });

  it('should display user email prefix when name is not available', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: { email: 'test@example.com' },
      isLoggedIn: true,
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavBar />);

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should display user initial avatar when logged in', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: { name: '李四', email: 'lisi@example.com' },
      isLoggedIn: true,
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavBar />);

    // Should show the first letter of the name
    expect(screen.getByText('李')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    mockedUseCurrentUser.mockReturnValue({
      user: { name: '王五', email: 'wangwu@example.com' },
      isLoggedIn: true,
      updateUser: vi.fn(),
      logout: mockLogout,
    });

    render(<NavBar />);

    const logoutButton = screen.getByText('退出');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should have link to login page when not logged in', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: null,
      isLoggedIn: false,
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavBar />);

    const loginLink = screen.getByRole('link', { name: /登录 \/ 注册/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should render as fixed header with correct styling classes', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: null,
      isLoggedIn: false,
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(<NavBar />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('fixed', 'left-0', 'right-0', 'top-0', 'z-50');
  });
});
