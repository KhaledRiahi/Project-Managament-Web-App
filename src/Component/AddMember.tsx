import React, { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip, TextField } from '@mui/material';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { addMember, deleteMember, getMembers, updateMember } from "../Backend/Querries";
import { Member } from '../Types';

const MemberTable = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'memberName',
        header: 'Member Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.memberName,
          helperText: validationErrors?.memberName,
          onFocus: () => setValidationErrors({ ...validationErrors, memberName: undefined }),
        },
      },
      {
        accessorKey: 'cvShort',
        header: 'CV Short',
        Cell: ({ cell }) => (
          cell.getValue() ? <a href={cell.getValue() as string} target="_blank" rel="noopener noreferrer">View CV</a> : 'No CV Uploaded'
        ),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.cvShort,
          helperText: validationErrors?.cvShort,
          onFocus: () => setValidationErrors({ ...validationErrors, cvShort: undefined }),
          type: 'file',
        },
      },
      {
        accessorKey: 'cvLong',
        header: 'CV Long',
        Cell: ({ cell }) => (
          cell.getValue() ? <a href={cell.getValue() as string} target="_blank" rel="noopener noreferrer">View CV</a> : 'No CV Uploaded'
        ),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.cvLong,
          helperText: validationErrors?.cvLong,
          onFocus: () => setValidationErrors({ ...validationErrors, cvLong: undefined }),
          type: 'file',
        },
      },
      {
        accessorKey: 'service',
        header: 'Service',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.service,
          helperText: validationErrors?.service,
          onFocus: () => setValidationErrors({ ...validationErrors, service: undefined }),
          select: true,
          selectOptions: ['Mazars Cyber Security Services', 'Mazars Cyber Security Excellence Center'],
        },
      },
    ],
    [validationErrors],
  );

  const queryClient = useQueryClient();

  const { data: members = [], isLoading, isError, refetch } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: getMembers,
  });

  const createMemberMutation = useMutation({
    mutationFn: addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Member> }) => updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const handleCreateMember = async ({ values, table }: { values: Member; table: any }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createMemberMutation.mutateAsync(values);
    table.setCreatingRow(null);
  };

  const handleSaveMember = async ({ values, row, table }: { values: Member; row: any; table: any }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateMemberMutation.mutateAsync({ id: row.original.id, data: values });
    table.setEditingRow(null);
  };

  const handleDeleteMember = (row: any) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteMemberMutation.mutate(row.original.id);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const table = useMaterialReactTable({
    columns, // Ensure columns prop is provided
    data: members, // Ensure data prop is provided
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    getRowId: (row) => row.id as string,
    muiToolbarAlertBannerProps: isError ? { color: 'error', children: 'Error loading data' } : undefined,
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateMember,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveMember,
    renderTopToolbarCustomActions: () => (
      <Tooltip arrow title="Refresh Data">
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip arrow title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Delete">
          <IconButton color="error" onClick={() => handleDeleteMember(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return <MaterialReactTable {...table} />;
};

const validateUser = (member: Member) => {
  const errors: Record<string, string> = {};

  if (!member.memberName) {
    errors.memberName = 'Member Name is required';
  }

  if (!member.cvShort) {
    errors.cvShort = 'CV Short is required';
  }

  if (!member.cvLong) {
    errors.cvLong = 'CV Long is required';
  }

  if (!member.service) {
    errors.service = 'Service is required';
  }

  return errors;
};

const queryClient = new QueryClient();

const MemberTableWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <MemberTable />
  </QueryClientProvider>
);

export default MemberTableWithProvider;
