import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WorkoutLog from '@/app/(app)/workout/log';

const mockExerciseData = {
  exercises: [
    {
      id: '1',
      name: 'Bench Press',
      exercise: {
        name: 'Bench Press'
      },
      sets: [
        {
          id: '1',
          weight: 100,
          reps: 10,
          is_completed: false
        }
      ]
    }
  ]
};

// Properly type the fetch mock
const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

describe('WorkoutLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads workout data correctly', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockExerciseData)
    } as Response));

    const { getByText } = render(<WorkoutLog />);

    await waitFor(() => {
      expect(getByText('Bench Press')).toBeTruthy();
    });
  });

  it('handles set completion', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockExerciseData)
    } as Response));

    const { getByText, getAllByText } = render(<WorkoutLog />);
    
    await waitFor(() => {
      expect(getByText('Bench Press')).toBeTruthy();
    });

    const doneButtons = getAllByText('Done');
    fireEvent.press(doneButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout/'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });
}); 