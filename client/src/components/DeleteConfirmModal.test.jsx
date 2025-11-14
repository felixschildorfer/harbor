import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmModal from '../DeleteConfirmModal';

const mockHandlers = {
  onClose: vi.fn(),
  onConfirm: vi.fn()
};

describe('DeleteConfirmModal Component', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    expect(screen.getByText('Delete Anchor Model')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });

  it('should render cancel and delete buttons', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onClose: vi.fn() };
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={handlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    await user.click(screen.getByText('×'));
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onClose: vi.fn() };
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={handlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    await user.click(screen.getByText('Cancel'));
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it('should call onConfirm when delete button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onConfirm: vi.fn() };
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onConfirm={handlers.onConfirm}
        loading={false}
      />
    );
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    expect(handlers.onConfirm).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={true}
      />
    );
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Deleting...')).toBeDisabled();
  });

  it('should close modal when clicking outside overlay', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onClose: vi.fn() };
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={handlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    const overlay = screen.getByText(/Are you sure you want to delete/).closest('.modal-overlay');
    await user.click(overlay);
    expect(handlers.onClose).toHaveBeenCalled();
  });
});
