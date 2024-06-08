import React, { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import { getMembers, addMember, updateMember, deleteMember } from "../Backend/Querries";
import { Member, userType } from '../Types';
import { User } from 'firebase/auth';
import MazarsLogo from "../Assets/MazarsLogo.png";

type MemberTableProps = {
  user: User | userType; // Allow either Firebase User or custom userType
};

const MemberTable: React.FC<MemberTableProps> = ({ user }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const queryClient = useQueryClient();

  const columns = useMemo<MRT_ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () => setValidationErrors({ ...validationErrors, name: undefined }),
        },
      },
      {
        accessorKey: 'experience',
        header: 'Experience',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.experience,
          helperText: validationErrors?.experience,
          type: 'number', // Ensure this is a number field
          onFocus: () => setValidationErrors({ ...validationErrors, experience: undefined }),
        },
      },
      {
        accessorKey: 'position',
        header: 'Position',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.position,
          helperText: validationErrors?.position,
          onFocus: () => setValidationErrors({ ...validationErrors, position: undefined }),
        },
      },
      {
        accessorKey: 'certification',
        header: 'Certification',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.certification,
          helperText: validationErrors?.certification,
          onFocus: () => setValidationErrors({ ...validationErrors, certification: undefined }),
        },
      },
      {
        accessorKey: 'speciality',
        header: 'Speciality',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.speciality,
          helperText: validationErrors?.speciality,
          onFocus: () => setValidationErrors({ ...validationErrors, speciality: undefined }),
        },
      },
      {
        accessorKey: 'diploma',
        header: 'Diploma',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.diploma,
          helperText: validationErrors?.diploma,
          onFocus: () => setValidationErrors({ ...validationErrors,
            diploma: undefined }),
          },
        },
        {
          accessorKey: 'projects',
          header: 'Projects',
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.projects,
            helperText: validationErrors?.projects,
            onFocus: () => setValidationErrors({ ...validationErrors, projects: undefined }),
          },
        },
      ],
      [validationErrors],
    );
  
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
      const newValidationErrors = validateMember(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createMemberMutation.mutateAsync(values);
      table.setCreatingRow(null);
    };
  
    const handleSaveMember = async ({ values, row, table }: { values: Member; row: any; table: any }) => {
      const newValidationErrors = validateMember(values);
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
  
    const handleExportCV = (member: Member) => {
      const doc = new jsPDF();
  
      const img = new Image();
      img.onload = () => {
        const imgWidth = 50;
        const imgHeight = 20;
        const imgMargin = 10;
        const title = `CV de ${member.name}`;
  
        doc.addImage(img, 'PNG', imgMargin, imgMargin, imgWidth, imgHeight);
        doc.setFontSize(20);
        doc.setTextColor('#0071CE');
        doc.text(title, imgMargin + imgWidth + 10, imgMargin + imgHeight / 2, { align: 'left' });
  
        const startY = imgMargin + imgHeight + 20;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
  
        const frameMargin = 10;
        const frameWidth = doc.internal.pageSize.width - 2 * frameMargin;
        const frameHeight = doc.internal.pageSize.height - startY - frameMargin;
  
        doc.setDrawColor('#0071CE');
        doc.rect(frameMargin, startY, frameWidth, frameHeight);
  
        const lineHeight = 15;
        let textY = startY + lineHeight;
  
        const details = [
          { label: 'Name', value: member.name },
          { label: 'Experience', value: `${member.experience} years` },
          { label: 'Position', value: member.position },
          { label: 'Certification', value: member.certification },
          { label: 'Speciality', value: member.speciality },
          { label: 'Diploma', value: member.diploma },
          { label: 'Projects', value: member.projects },
        ];
  
        details.forEach(detail => {
          doc.text(`${detail.label}: ${detail.value}`, frameMargin + 5, textY);
          textY += lineHeight;
        });
  
        doc.save(`CV_de_${member.name}.pdf`);
      };
  
      img.src = MazarsLogo;
    };
  
    const handleRefresh = () => {
      refetch();
    };
  
    const table = useMaterialReactTable({
      columns,
      data: members,
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
      renderRowActions: ({ row, table }) => (
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => table.setEditingRow(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDeleteMember(row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CV">
            <IconButton color="primary" onClick={() => handleExportCV(row.original)}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      renderTopToolbarCustomActions: ({ table }) => (
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => table.setCreatingRow(true)}>
            Add Member
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
  
  const MemberTableWithProviders: React.FC<{ user: User | userType }> = ({ user }) => (
    <QueryClientProvider client={queryClient}>
      <MemberTable user={user} />
    </QueryClientProvider>
  );
  
  export default MemberTableWithProviders;
  
  const validateRequired = (value: string | File | undefined | null) => {
    if (value instanceof File) {
      return !!value.name; // Check if the file has a name
    }
    return !!value?.length;
  };
  
  function validateMember(member: Member) {
    return {
      name: !validateRequired(member.name) ? 'Name is Required' : '',
      experience: !validateRequired(member.experience?.toString()) ? 'Experience is Required' : '', // Convert number to string for validation
      position: !validateRequired(member.position) ? 'Position is Required' : '',
      certification: !validateRequired(member.certification) ? 'Certification is Required' : '',
      speciality: !validateRequired(member.speciality) ? 'Speciality is Required' : '',
      diploma: !validateRequired(member.diploma) ? 'Diploma is Required' : '',
      projects: !validateRequired(member.projects) ? 'Projects is Required' : '',
    };
  }
  