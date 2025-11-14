import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RenameModal from '../RenameModal';

const mockHandlers = {
  onClose: vi.fn(),
  onConfirm: vi.fn()
};

describe('RenameModal Component', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <RenameModal
        isOpen={false}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    expect(screen.getByText('Rename Anchor Model')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Model')).toBeInTheDocument();
  });

  it('should populate input with current name', () => {
    render(
      <RenameModal
        isOpen={true}
        currentName="Original Name"
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    expect(screen.getByDisplayValue('Original Name')).toBeInTheDocument();
  });

  it('should render cancel and rename buttons', () => {
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Rename')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onClose: vi.fn() };
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
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
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={handlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    await user.click(screen.getByText('Cancel'));
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it('should call onConfirm when rename button clicked with new name', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onConfirm: vi.fn() };
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={handlers.onConfirm}
        loading={false}
      />
    );
    const input = screen.getByDisplayValue('Test Model');
    await user.clear(input);
    await user.type(input, 'New Name');
    await user.click(screen.getByText('Rename'));
    expect(handlers.onConfirm).toHaveBeenCalledWith('New Name');
  });

  it('should support Enter key to submit', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onConfirm: vi.fn() };
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={handlers.onConfirm}
        loading={false}
      />
    );
    const input = screen.getByDisplayValue('Test Model');
    await user.clear(input);
    await user.type(input, 'New Name');
    await user.keyboard('{Enter}');
    expect(handlers.onConfirm).toHaveBeenCalledWith('New Name');
  });

  it('should disable rename button when name is empty', () => {
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    const input = screen.getByDisplayValue('Test Model');
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    const renameButton = screen.getByText('Rename');
    expect(renameButton).toBeDisabled();
  });

  it('should disable buttons when loading', () => {
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={true}
      />
    );
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Renaming...')).toBeDisabled();
  });

  it('should focus input on open', () => {
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    const input = screen.getByDisplayValue('Test Model');
    expect(input).toHaveFocus();
  });

  it('should trim whitespace when submitting', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onConfirm: vi.fn() };
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={mockHandlers.onClose}
        onConfirm={handlers.onConfirm}
        loading={false}
      />
    );
    const input = screen.getByDisplayValue('Test Model');
    await user.clear(input);
    await user.type(input, '  New Name  ');
    await user.click(screen.getByText('Rename'));
    expect(handlers.onConfirm).toHaveBeenCalledWith('New Name');
  });

  it('should close modal when clicking outside overlay', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onClose: vi.fn() };
    render(
      <RenameModal
        isOpen={true}
        currentName="Test Model"
        onClose={handlers.onClose}
        onConfirm={mockHandlers.onConfirm}
        loading={false}
      />
    );
    const overlay = screen.getByText(/New name:/).closest('.modal-overlay');
    await user.click(overlay);
    expect(handlers.onClose).toHaveBeenCalled();
  });
});
