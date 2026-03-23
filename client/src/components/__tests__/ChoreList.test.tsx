import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChoreList } from '../ChoreList';
import App from '@/App';

// Mock all the hooks
vi.mock('@/hooks/useChoreData', () => ({
  useChoreData: vi.fn(() => ({
    activeChores: [],
    completedChores: [],
    stats: [],
    loading: false,
    error: null,
    createChore: vi.fn(),
    updateChore: vi.fn(),
    completeChore: vi.fn(),
    deleteChore: vi.fn(),
  })),
}));

vi.mock('@/hooks/useFamilyData', () => ({
  useFamilyData: vi.fn(() => ({
    members: [],
    loading: false,
    error: null,
    addMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
    refetch: vi.fn(),
  })),
}));

vi.mock('@/hooks/usePinAuth', () => ({
  usePinAuth: vi.fn(() => ({
    withPinAuth: vi.fn(),
    showPinModal: false,
    closePinModal: vi.fn(),
    verifyPin: vi.fn(),
    isVerifying: false,
    pinError: null,
    clearError: vi.fn(),
  })),
}));

describe('ChoreList', () => {
  it('renders "Today\'s Chores" heading in daily view', () => {
    render(<ChoreList />);
    expect(screen.getByRole('heading', { name: "Today's Chores" })).toBeInTheDocument();
  });

  it('renders Add Chore button', () => {
    render(<ChoreList />);
    expect(screen.getByRole('button', { name: 'Add Chore' })).toBeInTheDocument();
  });

  it('shows "No Chores Yet" empty state when no chores', () => {
    render(<ChoreList />);
    expect(screen.getByText('No Chores Yet')).toBeInTheDocument();
    expect(screen.getByText('Tap Add Chore to create your first task.')).toBeInTheDocument();
  });
});

describe('ChoreList with active chores', () => {
  it('renders ChoreCard for each active chore', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Take out trash',
        description: null,
        assigned_to: 1,
        completed_by: null,
        points: 5,
        status: 'active' as const,
        is_recurring: 0,
        recurrence_config: null,
        parent_chore_id: null,
        created_at: 1234567890,
        completed_at: null,
        updated_at: 1234567890,
        assignee_name: 'Alice',
        completed_by_name: null,
      },
      {
        id: 2,
        title: 'Feed the cat',
        description: null,
        assigned_to: 2,
        completed_by: null,
        points: 3,
        status: 'active' as const,
        is_recurring: 0,
        recurrence_config: null,
        parent_chore_id: null,
        created_at: 1234567891,
        completed_at: null,
        updated_at: 1234567891,
        assignee_name: 'Bob',
        completed_by_name: null,
      },
    ];

    const mockMembers = [
      { id: 1, name: 'Alice', created_at: 123, updated_at: 123 },
      { id: 2, name: 'Bob', created_at: 124, updated_at: 124 },
    ];

    const { useChoreData } = await import('@/hooks/useChoreData');
    const { useFamilyData } = await import('@/hooks/useFamilyData');

    vi.mocked(useChoreData).mockReturnValue({
      activeChores: mockChores,
      completedChores: [],
      stats: [],
      loading: false,
      error: null,
      chores: mockChores,
      createChore: vi.fn(),
      updateChore: vi.fn(),
      completeChore: vi.fn(),
      undoComplete: vi.fn(),
      deleteChore: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useFamilyData).mockReturnValue({
      members: mockMembers,
      loading: false,
      error: null,
      addMember: vi.fn(),
      updateMember: vi.fn(),
      deleteMember: vi.fn(),
      refetch: vi.fn(),
    });

    render(<ChoreList />);

    expect(screen.getByText('Take out trash')).toBeInTheDocument();
    expect(screen.getByText('Feed the cat')).toBeInTheDocument();
  });
});

describe('ChoreList celebration states', () => {
  it('shows CelebrationMessage when all daily chores complete', async () => {
    const completedChores = [
      {
        id: 1,
        title: 'Take out trash',
        description: null,
        assigned_to: 1,
        completed_by: 1,
        points: 5,
        status: 'completed' as const,
        is_recurring: 0,
        recurrence_config: null,
        parent_chore_id: null,
        created_at: 1234567890,
        completed_at: 1234567900,
        updated_at: 1234567900,
        assignee_name: 'Alice',
        completed_by_name: 'Alice',
      },
    ];

    const { useChoreData } = await import('@/hooks/useChoreData');

    vi.mocked(useChoreData).mockReturnValue({
      activeChores: [],
      completedChores: completedChores,
      stats: [],
      loading: false,
      error: null,
      chores: completedChores,
      createChore: vi.fn(),
      updateChore: vi.fn(),
      completeChore: vi.fn(),
      undoComplete: vi.fn(),
      deleteChore: vi.fn(),
      refetch: vi.fn(),
    });

    render(<ChoreList />);

    expect(screen.getByText('All Done for Today!')).toBeInTheDocument();
  });
});

describe('App', () => {
  it('renders ChoreList', () => {
    render(<App />);
    // ChoreList renders "Today's Chores" heading
    expect(screen.getByRole('heading', { name: "Today's Chores" })).toBeInTheDocument();
  });
});
