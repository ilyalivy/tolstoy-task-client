import { jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiURLForm from '../components/MultiURLForm';
import axios from 'axios';

describe('MultiURLForm Component', () => {
  test('renders the form with three input fields by default', () => {
    render(<MultiURLForm />);
    const inputs = screen.getAllByPlaceholderText(/URL/);
    expect(inputs).toHaveLength(3);
  });

  test('adds a new input field when "Add another URL" button is clicked', () => {
    render(<MultiURLForm />);
    const addButton = screen.getByText('Add another URL');
    fireEvent.click(addButton);
    const inputs = screen.getAllByPlaceholderText(/URL/);
    expect(inputs).toHaveLength(4);
  });

  test('displays an error if fewer than 3 URLs are submitted', async () => {
    render(<MultiURLForm />);
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Please enter at least 3 URLs.')).toBeInTheDocument();
    });
  });

  test('fetches metadata for the provided URLs when the form is submitted', async () => {
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: [
        { url: 'https://example.com', title: 'Example Domain', description: 'Example Description', image: null, error: null },
        { url: 'https://example2.com', title: 'Example Domain 2', description: 'Example Description 2', image: null, error: null },
        { url: 'https://example3.com', title: 'Example Domain 3', description: 'Example Description 3', image: null, error: null },
      ],
    });

    render(<MultiURLForm />);
    fireEvent.change(screen.getAllByPlaceholderText(/URL/)[0], { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/URL/)[1], { target: { value: 'https://example2.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/URL/)[2], { target: { value: 'https://example3.com' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
      expect(screen.getByText('Example Domain 2')).toBeInTheDocument();
      expect(screen.getByText('Example Domain 3')).toBeInTheDocument();
    });
  });

  test('handles network errors correctly', async () => {
    jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Network Error'));
    render(<MultiURLForm />);
    fireEvent.change(screen.getAllByPlaceholderText(/URL/)[0], { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/URL/)[1], { target: { value: 'https://example2.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/URL/)[2], { target: { value: 'https://example3.com' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getAllByText('Network Error')).toHaveLength(3);
    });
  });
});