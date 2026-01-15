import { render, screen } from '@testing-library/react';
import EmptyState from './empty-state';

describe('EmptyState', () => {
  it('shows title, description, and action', () => {
    render(
      <EmptyState
        title="Sin datos"
        description="Aun no hay registros"
        action={<button type="button">Crear</button>}
      />
    );

    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByText('Aun no hay registros')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });
});
