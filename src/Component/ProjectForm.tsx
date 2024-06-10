import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import { getMembers, getClients, uploadFile1 } from "../Backend/Querries";
import { Project, Member, Client } from '../Types';
import Input from './Input';

type ProjectFormProps = {
  project?: Project;
  onSave: (project: Project) => void;
  onClose: () => void;
};

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState<Project>(project || {
    id: '',
    projectName: '',
    clientName: [],
    mazars: [{ Name: '' }],
    interventionTeam: [
      { name: '', role: '', ChefOfProject: '', technicalConsultant: '' },
      { name: '', role: 'Chef de Projet', ChefOfProject: 'Yes', technicalConsultant: '' },
      { name: '', role: 'Consultant Technique', ChefOfProject: '', technicalConsultant: 'Yes' },
    ],
    projectDuration: '',
    completionDate: '',
    orderYear: '',
    startDate: '',
    partnerNames: '',
    serviceDescription: '',
    missionDeliverables: '',
    technicalOffer: '',
    BDC: '',
    PV:'',
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<{ name: string, role: string, ChefOfProject: string, technicalConsultant: string }[]>([
    { name: '', role: '', ChefOfProject: '', technicalConsultant: '' },
    { name: '', role: 'Chef de Projet', ChefOfProject: 'Yes', technicalConsultant: '' },
    { name: '', role: 'Consultant Technique', ChefOfProject: '', technicalConsultant: 'Yes' },
  ]);

  const [selectedClients, setSelectedClients] = useState<{ Name: string, ClientAdress: string }[]>([
    { Name: '', ClientAdress: '' },
  ]);

  useEffect(() => {
    const fetchMembersAndClients = async () => {
      try {
        const [membersData, clientsData] = await Promise.all([getMembers(), getClients()]);
        setMembers(membersData);
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchMembersAndClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClientChange = (index: number, key: 'Name' | 'ClientAdress', value: string) => {
    const updatedClients = [...selectedClients];
    const selectedClient = clients.find(client => client.clientName === value);
    if (selectedClient) {
      updatedClients[index] = {
        Name: selectedClient.clientName,
        ClientAdress: selectedClient.location,
      };
      setSelectedClients(updatedClients);
      setFormData({ ...formData, clientName: updatedClients });
    }
  };

  const handleMazarsChange = (index: number, key: keyof typeof formData.mazars[0], value: string) => {
    const updatedMazars = [...formData.mazars];
    updatedMazars[index] = {
      ...updatedMazars[index],
      [key]: value,
    };
    setFormData({ ...formData, mazars: updatedMazars });
  };

  const handleSelectedMemberChange = (index: number, key: 'name' | 'role', value: string) => {
    const updatedSelectedMembers = [...selectedMembers];
    updatedSelectedMembers[index] = {
      ...updatedSelectedMembers[index],
      [key]: value,
    };
    setSelectedMembers(updatedSelectedMembers);
  };

  const handleAddMember = () => {
    setSelectedMembers([...selectedMembers, { name: '', role: '', ChefOfProject: '', technicalConsultant: '' }]);
    setFormData({
      ...formData,
      interventionTeam: [...formData.interventionTeam, { name: '', role: '', ChefOfProject: '', technicalConsultant: '' }],
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'technicalOffer' | 'BDC'| 'PV') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = await uploadFile1(file, `projects/${file.name}`);
      setFormData({ ...formData, [type]: url });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.projectName.trim()) {
      toast.error('Project Name is required');
      return false;
    }
    if (!formData.projectDuration.trim()) {
      toast.error('Project Duration is required');
      return false;
    }
    if (!formData.completionDate.trim()) {
      toast.error('Completion Date is required');
      return false;
    }
    if (!formData.orderYear.trim()) {
      toast.error('Order Year is required');
      return false;
    }
    if (!formData.startDate.trim()) {
      toast.error('Start Date is required');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    const updatedInterventionTeam = selectedMembers.map(member => ({
      name: member.name,
      role: member.role,
      ChefOfProject: member.role === 'Chef de Projet' ? 'Yes' : '',
      technicalConsultant: member.role === 'Consultant Technique' ? 'Yes' : ''
    }));
    onSave({ ...formData, interventionTeam: updatedInterventionTeam });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{project ? 'Edit Project' : 'Add Project'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
          {/* Project Details */}
          <Typography variant="h6" gutterBottom>Project Details</Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            margin="dense"
            name="projectName"
            label="Project Name"
            type="text"
            fullWidth
            required
            value={formData.projectName}
            onChange={handleInputChange}
            placeholder="Enter project name"
          />

          {/* Equipe intervenante */}
          <Typography variant="h6" gutterBottom>Equipe intervenante</Typography>
          <Divider sx={{ mb: 2 }} />
          {selectedMembers.map((member, index) => (
            <Box key={index} sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <FormControl fullWidth margin="dense">
                <InputLabel id={`member-select-label-${index}`}>Select Member {index + 1}</InputLabel>
                <Select
                  labelId={`member-select-label-${index}`}
                  value={member.name}
                  onChange={(e) => handleSelectedMemberChange(index, 'name', e.target.value as string)}
                >
                  {members.map((m) => (
                    <MenuItem key={m.id} value={m.name}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name={`interventionTeamRole-${index}`}
                label={`Role for ${member.name}`}
                type="text"
                fullWidth
                required
                value={member.role}
                onChange={(e) => handleSelectedMemberChange(index, 'role', e.target.value)}
                placeholder="Enter role"
                InputProps={{
                  readOnly: index > 0 && index < 3, // Readonly for predefined roles
                }}
              />
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddMember} sx={{ mt: 2 }}>
            Add Member
          </Button>

          {/* Client Information */}
          <Typography variant="h6" gutterBottom sx={{ marginTop: '20px' }}>
            Client Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {selectedClients.map((client, index) => (
            <Box key={index} sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <FormControl fullWidth margin="dense">
                <InputLabel id={`client-select-label-${index}`}>Select Client {index + 1}</InputLabel>
                <Select
                  labelId={`client-select-label-${index}`}
                  value={client.Name}
                  onChange={(e) => handleClientChange(index, 'Name', e.target.value as string)}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.clientName}>
                      {c.clientName} - {c.location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name={`clientAddress-${index}`}
                label={`Client Address ${index + 1}`}
                type="text"
                fullWidth
                required
                value={client.ClientAdress}
                InputProps={{
                  readOnly: true,
                }}
                placeholder="Client address"
              />
            </Box>
          ))}

          {/* Project Timeline */}
          <Typography variant="h6" gutterBottom sx={{ marginTop: '20px' }}>
            Project Timeline
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            margin="dense"
            name="projectDuration"
            label="Project Duration"
            type="text"
            fullWidth
            required
            value={formData.projectDuration}
            onChange={handleInputChange}
            placeholder="Enter project duration"
          />
          <TextField
            margin="dense"
            name="completionDate"
            label="Completion Date"
            type="date"
            fullWidth
            required
            value={formData.completionDate}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="orderYear"
            label="Order Year"
            type="text"
            fullWidth
            required
            value={formData.orderYear}
            onChange={handleInputChange}
            placeholder="Enter order year"
          />
          <TextField
            margin="dense"
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            required
            value={formData.startDate}
            onChange={handleInputChange}
          />

          {/* File Upload Fields */}
          <Typography variant="h6" gutterBottom sx={{ marginTop: '20px' }}>
            File Uploads
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box mt={2}>
            <Typography variant="body2">Upload Technical Offer</Typography>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, 'technicalOffer')}
              name={''}
            />
            {formData.technicalOffer && <Typography variant="body2">Technical Offer: {formData.technicalOffer}</Typography>}
          </Box>
          <Box mt={2}>
            <Typography variant="body2">Upload BDC</Typography>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, 'BDC')}
              name={''}
            />
            {formData.BDC && <Typography variant="body2">BDC: {formData.BDC}</Typography>}
          </Box>
          <Box mt={2}>
            <Typography variant="body2">Upload PV</Typography>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, 'PV')}
              name={''}
            />
            {formData.PV && <Typography variant="body2">PV: {formData.PV}</Typography>}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectForm;
