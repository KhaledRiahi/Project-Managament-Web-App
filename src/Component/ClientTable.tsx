import React, { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { addClient, deleteClient, getClients, updateClient,  } from "../Backend/Querries"; // Ensure the correct path
import { Client } from '../Types';
const Example = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: 'clientName',
        header: 'Client Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.clientName,
          helperText: validationErrors?.clientName,
          onFocus: () => setValidationErrors({ ...validationErrors, clientName: undefined }),
        },
      },
      {
        accessorKey: 'sector',
        header: 'Sector of Activity',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.sector,
          helperText: validationErrors?.sector,
          onFocus: () => setValidationErrors({ ...validationErrors, sector: undefined }),
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.location,
          helperText: validationErrors?.location,
          onFocus: () => setValidationErrors({ ...validationErrors, location: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, isError, refetch } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const createClientMutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleCreateClient = async ({ values, table }: { values: Client; table: any }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createClientMutation.mutateAsync(values);
    table.setCreatingRow(null);
  };

  const handleSaveClient = async ({ values, row, table }: { values: Client; row: any; table: any }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateClientMutation.mutateAsync({ id: row.original.id, data: values });
    table.setEditingRow(null);
  };

  const handleDeleteClient = (row: any) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(row.original.id);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const table = useMaterialReactTable({
    columns,
    data: clients,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    getRowId: (row) => row.id as string,
    muiToolbarAlertBannerProps: isError ? { color: 'error', children: 'Error loading data' } : undefined,
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateClient,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveClient,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDeleteClient(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
          Create New Client
        </Button>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <Example />
  </QueryClientProvider>
);

export default ExampleWithProviders;

const validateRequired = (value: string | undefined | null) => !!value?.length;

function validateUser(client: Client) {
  return {
    clientName: !validateRequired(client.clientName) ? 'Client Name is Required' : '',
    sector: !validateRequired(client.sector) ? 'Sector is Required' : '',
    location: !validateRequired(client.location) ? 'Location is Required' : '',
  };
}
