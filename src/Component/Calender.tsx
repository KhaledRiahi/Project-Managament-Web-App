import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Project } from '../Types';
import { getProjects } from '../Backend/Querries';


const localizer = momentLocalizer(moment);

const calculateDaysLeft = (completionDate: string): number => {
  const currentDate = new Date();
  const endDate = new Date(completionDate);
  return Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
};

const determineStatus = (daysLeft: number): string => {
  if (daysLeft <= 0) return 'Ended';
  if (daysLeft <= 1) return 'Very Soon';
  if (daysLeft <= 7) return 'Soon';
  return 'Upcoming';
};

const CalendarComponent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const projectsData = await getProjects();
      const projectsWithStatus = projectsData.map(project => {
        const daysLeft = calculateDaysLeft(project.completionDate);
        const status = determineStatus(daysLeft);
        return { ...project, daysLeft, status };
      });
      setProjects(projectsWithStatus);
    };
    fetchProjects();
  }, []);

  const events = projects.map((project) => ({
    title: project.projectName,
    start: new Date(project.startDate),
    end: new Date(project.completionDate),
    project,
  }));

  const handleSelectEvent = (event: any) => {
    setSelectedProject(event.project);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
      />
     
    </div>
  );
};

export default CalendarComponent;
