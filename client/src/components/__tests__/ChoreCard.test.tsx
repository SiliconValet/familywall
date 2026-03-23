import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FamilyMemberBadge } from '../FamilyMemberBadge';
import { ChoreCard } from '../ChoreCard';
import { CompletedSection } from '../CompletedSection';
import { CelebrationMessage } from '../CelebrationMessage';
import type { Chore } from '@/types/chore';
import type { FamilyMember } from '@/types/family';

// Mock the hooks
vi.mock('@/hooks/useLongPress', () => ({
  useLongPress: ({ onClick, onLongPress }: any) => ({
    onClick,
    onLongPress,
    onTouchStart: vi.fn(),
    onTouchEnd: vi.fn(),
    onTouchMove: vi.fn(),
    onTouchCancel: vi.fn(),
    onMouseDown: vi.fn(),
    onMouseUp: vi.fn(),
    onMouseMove: vi.fn(),
    onMouseLeave: vi.fn(),
  }),
}));

const mockFamilyMembers: FamilyMember[] = [
  { id: 1, name: 'Alice', created_at: 123, updated_at: 123 },
  { id: 2, name: 'Bob', created_at: 124, updated_at: 124 },
];

const mockChore: Chore = {
  id: 1,
  title: 'Take out trash',
  description: null,
  assigned_to: 1,
  completed_by: null,
  points: 5,
  status: 'active',
  is_recurring: 0,
  recurrence_config: null,
  parent_chore_id: null,
  created_at: 1234567890,
  completed_at: null,
  updated_at: 1234567890,
  assignee_name: 'Alice',
  completed_by_name: null,
};

describe('FamilyMemberBadge', () => {
  it('renders initial letter and applies chart color', () => {
    const { container } = render(<FamilyMemberBadge name="Alice" colorIndex={0} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    const badge = container.querySelector('div');
    expect(badge).toHaveStyle({ backgroundColor: 'var(--chart-1)' });
  });
});

describe('ChoreCard', () => {
  it('renders chore title, assignee name, and points', () => {
    render(
      <ChoreCard
        chore={mockChore}
        colorIndex={0}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        familyMembers={mockFamilyMembers}
      />
    );

    expect(screen.getByText('Take out trash')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('5pts')).toBeInTheDocument();
  });

  it('has 48px checkbox touch target', () => {
    const { container } = render(
      <ChoreCard
        chore={mockChore}
        colorIndex={0}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        familyMembers={mockFamilyMembers}
      />
    );

    const checkboxWrapper = container.querySelector('.min-w-12.min-h-12');
    expect(checkboxWrapper).toBeInTheDocument();
  });

  it('calls onComplete on checkbox click', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <ChoreCard
        chore={mockChore}
        colorIndex={0}
        onComplete={onComplete}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        familyMembers={mockFamilyMembers}
      />
    );

    const checkboxWrapper = screen.getByRole('checkbox').closest('.min-w-12.min-h-12');
    if (checkboxWrapper) {
      await user.click(checkboxWrapper);
      expect(onComplete).toHaveBeenCalledWith(mockChore.id);
    }
  });

  it('shows edit and delete buttons with ARIA labels', () => {
    render(
      <ChoreCard
        chore={mockChore}
        colorIndex={0}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        familyMembers={mockFamilyMembers}
      />
    );

    expect(screen.getByLabelText('Edit chore')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete chore')).toBeInTheDocument();
  });
});

describe('CompletedSection', () => {
  it('renders null when no completed chores', () => {
    const { container } = render(
      <CompletedSection
        chores={[]}
        colorIndexMap={new Map()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        familyMembers={mockFamilyMembers}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows "Completed (N)" header when chores present', () => {
    const completedChores = [
      { ...mockChore, id: 1, status: 'completed' as const },
      { ...mockChore, id: 2, status: 'completed' as const },
    ];

    render(
      <CompletedSection
        chores={completedChores}
        colorIndexMap={new Map([[1, 0]])}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        familyMembers={mockFamilyMembers}
      />
    );

    expect(screen.getByText('Completed (2)')).toBeInTheDocument();
  });
});

describe('CelebrationMessage', () => {
  it('displays "All Done for Today!" text', () => {
    render(<CelebrationMessage />);
    expect(screen.getByText('All Done for Today!')).toBeInTheDocument();
  });
});
