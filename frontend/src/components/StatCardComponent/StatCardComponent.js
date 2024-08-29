import React from 'react';
import { Card, CardContent, Typography, CardHeader, Icon } from '@mui/material';

const StatCardComponent = ({ title, value, icon }) => {
  return (
    <Card>
      <CardHeader
        title={title}
        subheader={value}
        avatar={<Icon className={icon} />}
      />
      <CardContent>
        {/* Additional content can go here */}
      </CardContent>
    </Card>
  );
};

export default StatCardComponent;