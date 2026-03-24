import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FamilyFormModal } from '../FamilyFormModal';

// Color palette defined in Plan 02 implementation (D-08)
const PALETTE = [
  '#D50000',
  '#E67C73',
  '#F4511E',
  '#F6BF26',
  '#33B679',
  '#0B8043',
  '#039BE5',
  '#3F51B5',
];

// Cast to any to write tests against the EXPECTED Plan 02 interface.
// Plan 02 changes FamilyFormModal to: onSubmit: (name: string, color: string) => Promise<void>
// and adds 8 color swatch buttons.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FamilyFormModalFuture = FamilyFormModal as any;

// RED until Plan 02 adds color swatch picker to FamilyFormModal
describe('FamilyFormModal - Color Swatches (D-08, D-09)', () => {
  it('renders 8 color swatches in add mode (D-08)', () => {
    render(
      <FamilyFormModalFuture
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        mode="add"
      />
    );

    // Each swatch should be a button with aria-label matching its hex color
    PALETTE.forEach((hex) => {
      expect(screen.getByLabelText(hex)).toBeInTheDocument();
    });
  });

  it('selected swatch has ring indicator (D-09)', async () => {
    const user = userEvent.setup();

    render(
      <FamilyFormModalFuture
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        mode="add"
      />
    );

    const swatch = screen.getByLabelText(PALETTE[0]);
    await user.click(swatch);

    // Selected swatch should have ring-2 class or aria-pressed="true"
    expect(swatch.classList.contains('ring-2') || swatch.getAttribute('aria-pressed') === 'true').toBe(true);
  });

  it('onSubmit receives name and color on form submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <FamilyFormModalFuture
        open={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        mode="add"
      />
    );

    // Fill name
    await user.type(screen.getByLabelText(/name/i), 'Alice');

    // Select a color swatch
    await user.click(screen.getByLabelText(PALETTE[2]));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add member/i }));

    expect(onSubmit).toHaveBeenCalledWith('Alice', PALETTE[2]);
  });
});
