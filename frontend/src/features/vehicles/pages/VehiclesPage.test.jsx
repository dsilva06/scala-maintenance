import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import VehiclesPage from './VehiclesPage';

vi.mock('../hooks/useVehicles', () => ({
  useVehicles: () => ({ data: [], isLoading: false, error: null }),
  useCreateVehicle: () => ({ mutateAsync: vi.fn() }),
  useUpdateVehicle: () => ({ mutateAsync: vi.fn() }),
  useDeleteVehicle: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/hooks/useErrorToast', () => ({
  useErrorToast: () => {},
}));

vi.mock('../components/VehicleForm', () => ({
  default: () => <div>VehicleForm</div>,
}));

vi.mock('../components/VehicleCard', () => ({
  default: () => <div>VehicleCard</div>,
}));

vi.mock('../components/VehicleFilters', () => ({
  default: () => <div>VehicleFilters</div>,
}));

describe('VehiclesPage', () => {
  it('renders empty state when there are no vehicles', () => {
    render(<VehiclesPage />);

    expect(screen.getByText('Gestión de Vehículos')).toBeInTheDocument();
    expect(screen.getByText('No hay vehículos registrados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo Vehículo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar Primer Vehículo' })).toBeInTheDocument();
  });
});
