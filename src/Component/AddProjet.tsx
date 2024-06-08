import React, { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getProjects, addProject, updateProject, deleteProject } from "../Backend/Querries";
import { Project } from '../Types';
import ProjectForm from "../Component/ProjectForm"; // Assuming you have this component to add/edit projects
import ProjectView from "../Component/ProjectView" // Assuming you have this component to view project details

const ProjectTable: React.FC = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [viewingProject, setViewingProject] = useState<Project | undefined>(undefined);
  const queryClient = useQueryClient();

  const columns = useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      { accessorKey: 'projectName', header: 'Project Name' },
      { accessorKey: 'completionDate', header: 'Completion Date' },
      { accessorKey: 'orderYear', header: 'Order Year' },
      { accessorKey: 'startDate', header: 'Start Date' },
    ],
    [],
  );

  const { data: projects = [], isLoading, isError, refetch } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const createProjectMutation = useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreateProject = async (values: Project) => {
    await createProjectMutation.mutateAsync(values);
    setIsFormOpen(false);
  };

  const handleSaveProject = async (values: Project) => {
    if (editingProject) {
      if (editingProject.id) {
        await updateProjectMutation.mutateAsync({ id: editingProject.id, data: values });
      } else {
        console.error('Editing project ID is undefined');
      }
      setEditingProject(undefined);
    } else {
      await createProjectMutation.mutateAsync(values);
    }
    setIsFormOpen(false);
  };

  const handleDeleteProject = (row: any) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(row.original.id);
    }
  };

  const handleEditProject = (row: any) => {
    setEditingProject(row.original);
    setIsFormOpen(true);
  };

  const handleViewProject = (row: any) => {
    setViewingProject(row.original);
    setIsViewOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  const table = useMaterialReactTable({
    columns,
    data: projects,
    enableColumnOrdering: true,
    enableEditing: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="View">
          <IconButton onClick={() => handleViewProject(row)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleEditProject(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDeleteProject(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsFormOpen(true)}>
          Add Project
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

  return (
    <>
      <MaterialReactTable table={table} />
      {isFormOpen && (
        <ProjectForm
          project={editingProject ?? undefined}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveProject}
        />
      )}
      {isViewOpen && viewingProject && (
        <ProjectView
          project={viewingProject}
          onClose={() => setIsViewOpen(false)}
          open={isViewOpen} // Pass open state to ProjectView
        />
      )}
    </>
  );
};

const queryClient = new QueryClient();

const TableProject: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ProjectTable />
  </QueryClientProvider>
);

export default TableProject;
