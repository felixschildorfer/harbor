import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateModal from '../CreateModal';

const mockHandlers = {
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  setError: vi.fn()
};

describe('CreateModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <CreateModal
        isOpen={false}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    expect(screen.getByText('Create New Anchor Model')).toBeInTheDocument();
  });

  it('should render form inputs', () => {
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    expect(screen.getByPlaceholderText('Enter anchor model name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your XML content here...')).toBeInTheDocument();
  });

  it('should close modal when close button clicked', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onClose: vi.fn() };
    render(
      <CreateModal
        isOpen={true}
        onClose={handlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    await user.click(screen.getByText('×'));
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it('should validate empty name field', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, setError: vi.fn() };
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={handlers.setError}
      />
    );
    const submitButton = screen.getByText('Create Anchor Model');
    await user.click(submitButton);
    expect(handlers.setError).toHaveBeenCalledWith('Please enter a name for the anchor model');
  });

  it('should validate empty xmlContent field', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, setError: vi.fn() };
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={handlers.setError}
      />
    );
    const nameInput = screen.getByPlaceholderText('Enter anchor model name');
    await user.type(nameInput, 'Test Model');
    const submitButton = screen.getByText('Create Anchor Model');
    await user.click(submitButton);
    expect(handlers.setError).toHaveBeenCalledWith('Please upload or paste XML content');
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onSubmit: vi.fn().mockResolvedValue(undefined) };
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={handlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    const nameInput = screen.getByPlaceholderText('Enter anchor model name');
    const xmlInput = screen.getByPlaceholderText('Paste your XML content here...');
    
    await user.type(nameInput, 'Test Model');
    await user.type(xmlInput, '<schema></schema>');
    
    const submitButton = screen.getByText('Create Anchor Model');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(handlers.onSubmit).toHaveBeenCalledWith({
        name: 'Test Model',
        xmlContent: '<schema></schema>'
      });
    });
  });

  it('should disable submit button when loading', () => {
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={true}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    expect(screen.getByText('Creating...')).toBeDisabled();
  });

  it('should reject non-XML files', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, setError: vi.fn() };
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={handlers.setError}
      />
    );
    const fileInput = screen.getByLabelText('Upload XML File');
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    await user.upload(fileInput, file);
    expect(handlers.setError).toHaveBeenCalledWith('Please upload a .xml file');
  });

  it('should accept XML files', async () => {
    const user = userEvent.setup();
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    const fileInput = screen.getByLabelText('Upload XML File');
    const file = new File(['<schema></schema>'], 'test.xml', { type: 'application/xml' });
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText('File selected: test.xml')).toBeInTheDocument();
    });
  });

  it('should handle drag and drop for XML files', async () => {
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    
    const form = screen.getByDisplayValue('').parentElement.parentElement;
    const file = new File(['<schema></schema>'], 'test.xml', { type: 'application/xml' });
    
    fireEvent.drop(form, {
      dataTransfer: {
        files: [file],
        dropEffect: 'copy'
      }
    });
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Paste your XML content here...');
      expect(textarea).toHaveValue('<schema></schema>');
    });
  });

  it('should reject non-XML files in drag and drop', async () => {
    const handlers = { ...mockHandlers, setError: vi.fn() };
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={mockHandlers.onSubmit}
        loading={false}
        error={null}
        setError={handlers.setError}
      />
    );
    
    const form = screen.getByDisplayValue('').parentElement.parentElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.drop(form, {
      dataTransfer: {
        files: [file]
      }
    });
    
    expect(handlers.setError).toHaveBeenCalledWith('Please drop a .xml file');
  });

  it('should trim whitespace from name and content', async () => {
    const user = userEvent.setup();
    const handlers = { ...mockHandlers, onSubmit: vi.fn().mockResolvedValue(undefined) };
    render(
      <CreateModal
        isOpen={true}
        onClose={mockHandlers.onClose}
        onSubmit={handlers.onSubmit}
        loading={false}
        error={null}
        setError={mockHandlers.setError}
      />
    );
    const nameInput = screen.getByPlaceholderText('Enter anchor model name');
    const xmlInput = screen.getByPlaceholderText('Paste your XML content here...');
    
    await user.type(nameInput, '  Test Model  ');
    await user.type(xmlInput, '  <schema></schema>  ');
    
    const submitButton = screen.getByText('Create Anchor Model');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(handlers.onSubmit).toHaveBeenCalledWith({
        name: 'Test Model',
        xmlContent: '<schema></schema>'
      });
    });
  });
});
