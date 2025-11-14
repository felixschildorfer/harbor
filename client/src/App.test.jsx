import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock axios
vi.mock('../services/api', () => ({
  anchorModelsAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

import { anchorModelsAPI } from '../services/api';

const mockModels = [
  {
    _id: '1',
    name: 'Model 1',
    xmlContent: '<schema></schema>',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Model 2',
    xmlContent: '<schema></schema>',
    version: 2,
    createdAt: new Date(Date.now() - 1000).toISOString()
  }
];

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    anchorModelsAPI.getAll.mockResolvedValue({ data: mockModels });
  });

  describe('Model List', () => {
    it('should display loading state initially', () => {
      anchorModelsAPI.getAll.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );
      render(<App />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should fetch and display all models on mount', async () => {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
        expect(screen.getByText('Model 2')).toBeInTheDocument();
      });
      expect(anchorModelsAPI.getAll).toHaveBeenCalledTimes(1);
    });

    it('should display empty state when no models exist', async () => {
      anchorModelsAPI.getAll.mockResolvedValue({ data: [] });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('No anchor models found. Create your first anchor model!')).toBeInTheDocument();
      });
    });

    it('should display error message when fetch fails', async () => {
      anchorModelsAPI.getAll.mockRejectedValue({
        response: { data: { message: 'Server error' } }
      });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });
    });

    it('should show version number for each model', async () => {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Version 1')).toBeInTheDocument();
        expect(screen.getByText('Version 2')).toBeInTheDocument();
      });
    });
  });

  describe('Create Modal', () => {
    it('should open create modal when button clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      const createButton = screen.getByText('Create New Anchor Model');
      await user.click(createButton);
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Name input
    });

    it('should close modal when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const cancelButton = screen.getAllByText('Cancel')[0];
      await user.click(cancelButton);
      // Modal should be closed (no form inputs visible)
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Enter anchor model name')).not.toBeInTheDocument();
      });
    });

    it('should validate required name field', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const submitButton = screen.getByText('Create Anchor Model');
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/Please enter a name/)).toBeInTheDocument();
      });
    });

    it('should validate required xmlContent field', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const nameInput = screen.getByPlaceholderText('Enter anchor model name');
      await user.type(nameInput, 'Test Model');
      const submitButton = screen.getByText('Create Anchor Model');
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/Please upload or paste XML content/)).toBeInTheDocument();
      });
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.create.mockResolvedValue({
        data: { _id: '3', name: 'New Model', xmlContent: '<schema></schema>', version: 1 }
      });
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const nameInput = screen.getByPlaceholderText('Enter anchor model name');
      const xmlTextarea = screen.getByPlaceholderText('Paste your XML content here...');
      await user.type(nameInput, 'New Model');
      await user.type(xmlTextarea, '<schema></schema>');
      const submitButton = screen.getByText('Create Anchor Model');
      await user.click(submitButton);
      await waitFor(() => {
        expect(anchorModelsAPI.create).toHaveBeenCalledWith({
          name: 'New Model',
          xmlContent: '<schema></schema>'
        });
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.create.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
      );
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const nameInput = screen.getByPlaceholderText('Enter anchor model name');
      const xmlTextarea = screen.getByPlaceholderText('Paste your XML content here...');
      await user.type(nameInput, 'Test');
      await user.type(xmlTextarea, '<schema></schema>');
      const submitButton = screen.getByText('Create Anchor Model');
      await user.click(submitButton);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('File Upload', () => {
    it('should accept XML files via file input', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const fileInput = screen.getByLabelText('Upload XML File');
      const file = new File(['<schema></schema>'], 'test.xml', { type: 'application/xml' });
      await user.upload(fileInput, file);
      await waitFor(() => {
        expect(screen.getByText(/File selected: test.xml/)).toBeInTheDocument();
      });
    });

    it('should reject non-XML files', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const fileInput = screen.getByLabelText('Upload XML File');
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      await user.upload(fileInput, file);
      await waitFor(() => {
        expect(screen.getByText(/Please upload a .xml file/)).toBeInTheDocument();
      });
    });

    it('should populate xmlContent when file is uploaded', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      const fileInput = screen.getByLabelText('Upload XML File');
      const file = new File(['<schema><test></test></schema>'], 'test.xml', { type: 'application/xml' });
      await user.upload(fileInput, file);
      const xmlTextarea = screen.getByPlaceholderText('Paste your XML content here...');
      await waitFor(() => {
        expect(xmlTextarea).toHaveValue('<schema><test></test></schema>');
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete confirmation modal when delete button clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByText('🗑️ Delete');
      await user.click(deleteButtons[0]);
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });

    it('should cancel delete when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByText('🗑️ Delete');
      await user.click(deleteButtons[0]);
      const cancelButtons = screen.getAllByText('Cancel');
      await user.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeInTheDocument();
    });

    it('should delete model when confirmed', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.delete.mockResolvedValue({ data: { message: 'Deleted' } });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByText('🗑️ Delete');
      await user.click(deleteButtons[0]);
      const confirmButton = screen.getByText('Delete', { selector: 'button' });
      await user.click(confirmButton);
      await waitFor(() => {
        expect(anchorModelsAPI.delete).toHaveBeenCalledWith('1');
      });
    });

    it('should remove model from list after successful deletion', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.delete.mockResolvedValue({ data: { message: 'Deleted' } });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByText('🗑️ Delete');
      await user.click(deleteButtons[0]);
      const confirmButton = screen.getByText('Delete', { selector: 'button' });
      await user.click(confirmButton);
      await waitFor(() => {
        expect(screen.queryByText('Model 1')).not.toBeInTheDocument();
      });
    });

    it('should show error when delete fails', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.delete.mockRejectedValue({
        response: { data: { message: 'Delete failed' } }
      });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByText('🗑️ Delete');
      await user.click(deleteButtons[0]);
      const confirmButton = screen.getByText('Delete', { selector: 'button' });
      await user.click(confirmButton);
      await waitFor(() => {
        expect(screen.getByText(/Delete failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Rename Functionality', () => {
    it('should show rename modal when rename button clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const renameButtons = screen.getAllByText('✏️ Rename');
      await user.click(renameButtons[0]);
      expect(screen.getByDisplayValue('Model 1')).toBeInTheDocument();
    });

    it('should rename model when form submitted', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.update.mockResolvedValue({
        data: { _id: '1', name: 'Renamed', xmlContent: '<schema></schema>', version: 1 }
      });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const renameButtons = screen.getAllByText('✏️ Rename');
      await user.click(renameButtons[0]);
      const input = screen.getByDisplayValue('Model 1');
      await user.clear(input);
      await user.type(input, 'Renamed');
      const submitButton = screen.getAllByText('Rename')[0];
      await user.click(submitButton);
      await waitFor(() => {
        expect(anchorModelsAPI.update).toHaveBeenCalledWith('1', { name: 'Renamed' });
      });
    });

    it('should support Enter key to submit rename', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.update.mockResolvedValue({
        data: { _id: '1', name: 'Updated', xmlContent: '<schema></schema>', version: 1 }
      });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const renameButtons = screen.getAllByText('✏️ Rename');
      await user.click(renameButtons[0]);
      const input = screen.getByDisplayValue('Model 1');
      await user.clear(input);
      await user.type(input, 'Updated');
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(anchorModelsAPI.update).toHaveBeenCalled();
      });
    });

    it('should disable submit button if name is empty', async () => {
      const user = userEvent.setup();
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      const renameButtons = screen.getAllByText('✏️ Rename');
      await user.click(renameButtons[0]);
      const input = screen.getByDisplayValue('Model 1');
      await user.clear(input);
      const submitButton = screen.getAllByText('Rename')[0];
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export model as XML file when export button clicked', async () => {
      const user = userEvent.setup();
      const createElementSpy = vi.spyOn(document, 'createElement');
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL', 'get').mockReturnValue('blob:mock');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      
      const exportButtons = screen.getAllByText('⬇️ Export');
      await user.click(exportButtons[0]);
      
      await waitFor(() => {
        expect(createElementSpy).toHaveBeenCalledWith('a');
      });
      
      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should use correct filename format for export', async () => {
      const user = userEvent.setup();
      const linkClickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === 'a') {
          element.click = linkClickSpy;
        }
        return element;
      });
      
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Model 1')).toBeInTheDocument();
      });
      
      const exportButtons = screen.getAllByText('⬇️ Export');
      await user.click(exportButtons[0]);
      
      await waitFor(() => {
        expect(linkClickSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should accept dropped XML files', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      
      const form = screen.getByDisplayValue('');
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

    it('should reject non-XML files via drag-drop', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      
      const form = screen.getByDisplayValue('');
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.drop(form, {
        dataTransfer: {
          files: [file]
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Please drop a .xml file/)).toBeInTheDocument();
      });
    });

    it('should show visual feedback when dragging over form', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText('Create New Anchor Model'));
      
      const form = screen.getByDisplayValue('');
      fireEvent.dragOver(form);
      
      await waitFor(() => {
        expect(form).toHaveClass('drag-over');
      });
    });
  });

  describe('Error Dismissal', () => {
    it('should dismiss error when dismiss button clicked', async () => {
      const user = userEvent.setup();
      anchorModelsAPI.getAll.mockRejectedValue({
        response: { data: { message: 'Test error' } }
      });
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText(/Test error/)).toBeInTheDocument();
      });
      const dismissButton = screen.getByText('Dismiss');
      await user.click(dismissButton);
      expect(screen.queryByText(/Test error/)).not.toBeInTheDocument();
    });
  });
});
