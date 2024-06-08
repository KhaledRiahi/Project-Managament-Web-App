import React from 'react';
import { Project } from '../Types';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import jsPDF from 'jspdf';
import MazarsLogo from '../Assets/MazarsLogo.png';

interface ProjectPDFProps {
  project: Project;
  onClose: () => void;
  open: boolean;
}

const ProjectPDF: React.FC<ProjectPDFProps> = ({ project, onClose, open }) => {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const img = new Image();
    img.onload = () => {
      const imgWidth = 50;
      const imgHeight = 20;
      const imgMargin = 10;

      // Centered logo
      const pageWidth = doc.internal.pageSize.width;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(img, 'PNG', imgX, imgMargin, imgWidth, imgHeight);

      let startY = imgMargin + imgHeight + 20;
      const frameMargin = 10;
      const frameWidth = pageWidth - 2 * frameMargin;
      const lineHeight = 15;
      let textY = startY;

      // Function to draw a blue border around a section
      const drawSectionBorder = (startY: number, height: number) => {
        doc.setDrawColor('#0071CE');
        doc.rect(frameMargin, startY, frameWidth, height);
      };

      // Function to add section title
      const addSectionTitle = (title: string, y: number) => {
        doc.setFontSize(16);
        doc.setTextColor('#0071CE');
        doc.text(title, frameMargin + 5, y);
        return y + lineHeight;
      };

      // Project Information Section
      let sectionStartY = textY;
      textY = addSectionTitle('Project Information', textY);

      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.text(`Project Name: ${project.projectName}`, frameMargin + 10, textY);
      textY += lineHeight;
      doc.text(`Project Duration: ${project.projectDuration}`, frameMargin + 10, textY);
      textY += lineHeight;
      doc.text(`Completion Date: ${project.completionDate}`, frameMargin + 10, textY);
      textY += lineHeight;
      doc.text(`Order Year: ${project.orderYear}`, frameMargin + 10, textY);
      textY += lineHeight;
      doc.text(`Start Date: ${project.startDate}`, frameMargin + 10, textY);
      textY += lineHeight;

      drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight);

      // Client Information Section
      textY += lineHeight;
      sectionStartY = textY;
      textY = addSectionTitle('Client Information', textY);

      project.clientName.forEach((client) => {
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(`Client Name: ${client.Name}`, frameMargin + 10, textY);
        textY += lineHeight;
        doc.text(`Client Address: ${client.ClientAdress}`, frameMargin + 10, textY);
        textY += lineHeight;
      });

      drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight);

      // Additional Information Section
      textY += lineHeight;
      sectionStartY = textY;
      textY = addSectionTitle('Additional Information', textY);

      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.text(`Partner Names: ${project.partnerNames}`, frameMargin + 10, textY);
      textY += lineHeight;
      doc.text(`Service Description: ${project.serviceDescription}`, frameMargin + 10, textY);
      textY += lineHeight;
      doc.text(`Mission Deliverables: ${project.missionDeliverables}`, frameMargin + 10, textY);
      textY += lineHeight;

      drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight);

      // Project Intervention Team Section
      textY += lineHeight;
      sectionStartY = textY;
      textY = addSectionTitle('Project Intervention Team', textY);

      project.interventionTeam.forEach((member) => {
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(`Name: ${member.name}`, frameMargin + 10, textY);
        textY += lineHeight;
        doc.text(`Role: ${member.role}`, frameMargin + 10, textY);
        textY += lineHeight;
      });

      drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight);

      doc.save(`Project_Details_${project.projectName}.pdf`);
    };

    img.src = MazarsLogo;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Project Details - {project.projectName}</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="h6">Project Information</Typography>
          <Typography variant="body1"><strong>Project Name:</strong> {project.projectName}</Typography>
          <Typography variant="body1"><strong>Project Duration:</strong> {project.projectDuration}</Typography>
          <Typography variant="body1"><strong>Completion Date:</strong> {project.completionDate}</Typography>
          <Typography variant="body1"><strong>Order Year:</strong> {project.orderYear}</Typography>
          <Typography variant="body1"><strong>Start Date:</strong> {project.startDate}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Client Information</Typography>
          {project.clientName.map((client, index) => (
            <Box key={index} mb={1}>
              <Typography variant="body1"><strong>Name:</strong> {client.Name}</Typography>
              <Typography variant="body1"><strong>Address:</strong> {client.ClientAdress}</Typography>
            </Box>
          ))}
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Additional Information</Typography>
          <Typography variant="body1"><strong>Partner Names:</strong> {project.partnerNames}</Typography>
          <Typography variant="body1"><strong>Service Description:</strong> {project.serviceDescription}</Typography>
          <Typography variant="body1"><strong>Mission Deliverables:</strong> {project.missionDeliverables}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Project Intervention Team</Typography>
          {project.interventionTeam.map((member, index) => (
            <Box key={index} mb={1}>
              <Typography variant="body1"><strong>Name:</strong> {member.name}</Typography>
              <Typography variant="body1"><strong>Role:</strong> {member.role}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
        <Button onClick={handleDownloadPDF} color="primary">Download PDF</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectPDF;
