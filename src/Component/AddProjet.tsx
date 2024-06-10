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
import ProjectForm from "../Component/ProjectForm";
import ProjectView from "../Component/ProjectView";

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
        console.log('Updating project with ID:', editingProject.id);
        await updateProjectMutation.mutateAsync({ id: editingProject.id, data: values });
      } else {
        console.error('Editing project ID is undefined', editingProject);
        alert('Failed to save project: Editing project ID is undefined');
      }
      setEditingProject(undefined);
    } else {
      await createProjectMutation.mutateAsync(values);
    }
    setIsFormOpen(false);
  };

  const handleDeleteProject = (row: any) => {
    console.log('Row object:', row);

    const projectId = row?.original?.id;
    
    if (!projectId) {
      alert('Invalid project ID');
      console.error('Invalid project ID:', row);
      return;
    }

    console.log('Project ID to be deleted:', projectId);

    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(projectId, {
        onError: (error) => {
          console.error('Deletion failed with error:', error);
          alert(`Failed to delete project: ${error}`);
        },
      });
    }
  };

  const handleEditProject = (row: any) => {
    console.log('Editing project row:', row);
    setEditingProject(row.original);
    setIsFormOpen(true);
  };

  const handleViewProject = (row: any) => {
    console.log('Viewing project row:', row);
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
          setEditingProject(undefined);
          setIsFormOpen(true);
        }}>
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
          open={isViewOpen}
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
