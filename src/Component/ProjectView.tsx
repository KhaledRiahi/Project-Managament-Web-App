import React from 'react';
import { Project } from '../Types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface ProjectViewProps {
  project: Project;
  onClose: () => void;
  open: boolean;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onClose, open }) => {
  const handleDownloadPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Set properties for the document
    doc.setProperties({
      title: `Project Details - ${project.projectName}`,
      subject: 'Project Details',
      author: 'Your Company',
      keywords: 'project, details',
    });

    // Define the content for the PDF
    const content = `
      Project Name: ${project.projectName}
      Project Duration: ${project.projectDuration}
      Completion Date: ${project.completionDate}
      Order Year: ${project.orderYear}
      Start Date: ${project.startDate}
      
      Client Information:
      ${project.clientName.map(client => `
        Name: ${client.Name}
        Address: ${client.ClientAdress}
      `).join('\n')}
      
      Equipe Intervenante:
      ${project.interventionTeam.map(member => `
        Name: ${member.name}
        Role: ${member.role}
      `).join('\n')}
      
      Additional Information:
      Partner Names: ${project.partnerNames}
      Service Description: ${project.serviceDescription}
      Mission Deliverables: ${project.missionDeliverables}
    `;

    // Add the content to the document
    doc.text(content, 10, 10);

    // Save the document
    doc.save(`ProjectDetails_${project.projectName}.pdf`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Project Details</DialogTitle>
      <DialogContent dividers>
        {/* Client Information */}
        <Box mb={2}>
          <Typography variant="h6">Client Information</Typography>
          {project.clientName.map((client, index) => (
            <Box key={index} mb={1}>
              <Typography variant="body1"><strong>Name:</strong> {client.Name}</Typography>
              <Typography variant="body1"><strong>Address:</strong> {client.ClientAdress}</Typography>
            </Box>
          ))}
        </Box>
        
        {/* Equipe Intervenante */}
        <Box mb={2}>
          <Typography variant="h6">Equipe Intervenante</Typography>
          {project.interventionTeam.map((member, index) => (
            <Box key={index} mb={1}>
              <Typography variant="body1"><strong>Name:</strong> {member.name}</Typography>
              <Typography variant="body1"><strong>Role:</strong> {member.role}</Typography>
              {member.ChefOfProject && (
                <Typography variant="body1"><strong>Chef of Project:</strong> Yes</Typography>
              )}
              {member.technicalConsultant && (
                <Typography variant="body1"><strong>Technical Consultant:</strong> Yes</Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Project Information */}
        <Box mb={2}>
          <Typography variant="h6">Project Information</Typography>
          <Typography variant="body1"><strong>Project Name:</strong> {project.projectName}</Typography>
          <Typography variant="body1"><strong>Project Duration:</strong> {project.projectDuration}</Typography>
          <Typography variant="body1"><strong>Completion Date:</strong> {project.completionDate}</Typography>
          <Typography variant="body1"><strong>Order Year:</strong> {project.orderYear}</Typography>
          <Typography variant="body1"><strong>Start Date:</strong> {project.startDate}</Typography>
        </Box>

        {/* Additional Information */}
        <Box mb={2}>
          <Typography variant="h6">Additional Information</Typography>
          <Typography variant="body1"><strong>Partner Names:</strong> {project.partnerNames}</Typography>
          <Typography variant="body1"><strong>Service Description:</strong> {project.serviceDescription}</Typography>
          <Typography variant="body1"><strong>Mission Deliverables:</strong> {project.missionDeliverables}</Typography>
        </Box>

        {/* Documents */}
        <Box mb={2}>
          <Typography variant="h6">Documents</Typography>
          {project.technicalOffer && (
            <Typography variant="body1"><strong>Technical Offer:</strong> <a href={project.technicalOffer} target="_blank" rel="noopener noreferrer">View File</a></Typography>
          )}
          {project.BDC && (
            <Typography variant="body1"><strong>BDC:</strong> <a href={project.BDC} target="_blank" rel="noopener noreferrer">View File</a></Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
        <Button onClick={handleDownloadPDF} color="primary">Download PDF</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectView;
