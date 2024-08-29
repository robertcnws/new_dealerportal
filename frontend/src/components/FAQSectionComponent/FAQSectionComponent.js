import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQSectionComponent = () => {

  const [expanded, setExpanded] = useState(false);

  // Handler to change the expanded state
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Card sx={{
      bgcolor: '#f1f1f1', 
      border: 'none', 
      boxShadow: 'none'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel1-header">
            <Typography sx={{ color: '#669A41' }}>Who are we?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>We are New Window System</strong>. We are a team of full-stack developers dedicated to providing a seamless dealer portal for the ordering and tracking of impact windows and doors. Our mission is to simplify and streamline the process, so you can focus on delivering the best service to your customers.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel2-header">
            <Typography sx={{ color: '#669A41' }}>What do we sell?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>We sell impact windows and doors</strong>. As a dealer, you can explore our stock and place orders directly through the dealer portal. All the product details, including the NOA, can be easily accessed within the portal.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel3-header">
            <Typography sx={{ color: '#669A41' }}>How does the ordering process work?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>It's a streamlined process</strong>. After you place an order, it will be in a processed status. Once accepted, you will have 12 hours to coordinate payment. Please note that once orders are accepted, they cannot be canceled.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel4-header">
            <Typography sx={{ color: '#669A41' }}>What if I need assistance?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>We're here to help</strong>. If you need assistance, you can contact us at (305) 603 9881 or at orders@newwindowsystem.com. For further support, you can check out our online tutorials on <a href="https://www.youtube.com">YouTube</a>.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel5-header">
            <Typography sx={{ color: '#669A41' }}>How many users can I have on my dealer account?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>Each dealer account can have up to 3 users</strong>. This includes 1 Dealer Admin and 2 Estimators. This setup allows for efficient management and delegation of tasks within your team.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel6-header">
            <Typography sx={{ color: '#669A41' }}>Can I create and export estimates?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>Yes, you can create and export as many estimates as needed</strong>. Our dealer portal has been designed with your needs in mind, and the estimate creation and export feature aims to further streamline your work processes.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FAQSectionComponent