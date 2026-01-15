import { render, screen } from '@testing-library/react';
import PageHeader from './page-header';

describe('PageHeader', () => {
  it('renders title and subtitle', () => {
    render(<PageHeader title="Gestión de Viajes" subtitle="Resumen de actividad" />);

    expect(screen.getByText('Gestión de Viajes')).toBeInTheDocument();
    expect(screen.getByText('Resumen de actividad')).toBeInTheDocument();
  });
});
