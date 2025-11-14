import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModelCard from '../ModelCard';

const mockModel = {
  _id: '1',
  name: 'Test Model',
  xmlContent: '<schema></schema>',
  version: 2
};

const mockHandlers = {
  onEdit: vi.fn(),
  onRename: vi.fn(),
  onDelete: vi.fn(),
  onExport: vi.fn()
};

describe('ModelCard Component', () => {
  it('should render model name and version', () => {
    render(
      <ModelCard
        model={mockModel}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Test Model')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
  });

  it('should render all action buttons', () => {
    render(
      <ModelCard
        model={mockModel}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('✏️ Edit in Anchor')).toBeInTheDocument();
    expect(screen.getByText('⬇️ Export')).toBeInTheDocument();
    expect(screen.getByText('✏️ Rename')).toBeInTheDocument();
    expect(screen.getByText('🗑️ Delete')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onEdit: vi.fn() };
    render(
      <ModelCard
        model={mockModel}
        {...handlers}
      />
    );
    await user.click(screen.getByText('✏️ Edit in Anchor'));
    expect(handlers.onEdit).toHaveBeenCalledWith('1');
  });

  it('should call onExport when export button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onExport: vi.fn() };
    render(
      <ModelCard
        model={mockModel}
        {...handlers}
      />
    );
    await user.click(screen.getByText('⬇️ Export'));
    expect(handlers.onExport).toHaveBeenCalledWith(mockModel);
  });

  it('should call onRename when rename button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onRename: vi.fn() };
    render(
      <ModelCard
        model={mockModel}
        {...handlers}
      />
    );
    await user.click(screen.getByText('✏️ Rename'));
    expect(handlers.onRename).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onDelete: vi.fn() };
    render(
      <ModelCard
        model={mockModel}
        {...handlers}
      />
    );
    await user.click(screen.getByText('🗑️ Delete'));
    expect(handlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('should render different versions correctly', () => {
    const models = [
      { ...mockModel, version: 1 },
      { ...mockModel, version: 5 },
      { ...mockModel, version: 100 }
    ];
    
    const { rerender } = render(
      <ModelCard model={models[0]} {...mockHandlers} />
    );
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    
    rerender(
      <ModelCard model={models[1]} {...mockHandlers} />
    );
    expect(screen.getByText('Version 5')).toBeInTheDocument();
    
    rerender(
      <ModelCard model={models[2]} {...mockHandlers} />
    );
    expect(screen.getByText('Version 100')).toBeInTheDocument();
  });
});
