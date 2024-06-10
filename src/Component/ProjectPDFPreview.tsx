import React, { useEffect, useRef } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import jsPDF from 'jspdf';
import MazarsLogo from '../Assets/MazarsLogo.png';
import { Project } from '../Types';

interface ProjectPDFPreviewProps {
  project: Project;
  onClose: () => void;
  open: boolean;
  onDownload: () => void;
}

const ProjectPDFPreview: React.FC<ProjectPDFPreviewProps> = ({ project, onClose, open, onDownload }) => {
  const pdfRef = useRef<jsPDF | null>(null);

  useEffect(() => {
    const generatePDF = async () => {
      const doc = new jsPDF();

      const img = new Image();
      img.src = MazarsLogo;

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
        const lineHeight = 10;
        let textY = startY;

        // Function to draw a border around a section
        const drawSectionBorder = (startY: number, height: number, color: string) => {
          doc.setDrawColor(color);
          doc.setLineWidth(0.5);
          doc.rect(frameMargin, startY, frameWidth, height);
        };

        // Function to add section title
        const addSectionTitle = (title: string, y: number, color: string) => {
          doc.setFontSize(14);
          doc.setTextColor(color);
          doc.text(title, frameMargin + 5, y);
          return y + lineHeight;
        };

        // Centered project name
        doc.setFontSize(16);
        doc.setTextColor('#081F8F');
        doc.text(`Project Name: ${project.projectName}`, pageWidth / 2, textY, { align: 'center' });
        textY += lineHeight + 10;

        // Project Information Section
        let sectionStartY = textY;
        textY = addSectionTitle('Project Information', textY, '#081F8F');

        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(`Project Duration: ${project.projectDuration}`, frameMargin + 10, textY);
        textY += lineHeight;
        doc.text(`Completion Date: ${project.completionDate}`, frameMargin + 10, textY);
        textY += lineHeight;
        doc.text(`Order Year: ${project.orderYear}`, frameMargin + 10, textY);
        textY += lineHeight;
        doc.text(`Start Date: ${project.startDate}`, frameMargin + 10, textY);
        textY += lineHeight;

        drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight, '#081F8F');

        // Client Information Section
        textY += lineHeight;
        sectionStartY = textY;
        textY = addSectionTitle('Client Information', textY, '#081F8F');

        project.clientName.forEach((client) => {
          doc.setFontSize(12);
          doc.setTextColor('#000000');
          doc.text(`Client Name: ${client.Name}`, frameMargin + 10, textY);
          textY += lineHeight;
          doc.text(`Client Address: ${client.ClientAdress}`, frameMargin + 10, textY);
          textY += lineHeight;
        });

        drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight, '#787878');

        // Additional Information Section
        textY += lineHeight;
        sectionStartY = textY;
        textY = addSectionTitle('Additional Information', textY, '#081F8F');

        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(`Partner Names: ${project.partnerNames}`, frameMargin + 10, textY);
        textY += lineHeight;
        doc.text(`Service Description: ${project.serviceDescription}`, frameMargin + 10, textY);
        textY += lineHeight;
        doc.text(`Mission Deliverables: ${project.missionDeliverables}`, frameMargin + 10, textY);
        textY += lineHeight;

        drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight, '#787878');

        // Project Intervention Team Section
        textY += lineHeight;
        sectionStartY = textY;
        textY = addSectionTitle('Project Intervention Team', textY, '#081F8F');

        project.interventionTeam.forEach((member) => {
          doc.setFontSize(12);
          doc.setTextColor('#000000');
          doc.text(`Name: ${member.name}`, frameMargin + 10, textY);
          textY += lineHeight;
          doc.text(`Role: ${member.role}`, frameMargin + 10, textY);
          textY += lineHeight;
        });

        drawSectionBorder(sectionStartY, textY - sectionStartY + lineHeight, '#787878');

        pdfRef.current = doc;
      };
    };

    if (open) {
      generatePDF();
    }
  }, [open, project]);

  const handleDownload = () => {
    if (pdfRef.current) {
      pdfRef.current.save(`Project_Details_${project.projectName}.pdf`);
      onDownload();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Preview Project PDF</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">Please review the document before downloading.</Typography>
        {/* Optionally display some summary or preview here */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
        <Button onClick={handleDownload} color="primary">Download PDF</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectPDFPreview;
