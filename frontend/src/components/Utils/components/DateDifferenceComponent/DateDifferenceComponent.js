import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const DateDifferenceComponent = ({ dateString }) => {
  const date = dateString instanceof String ? parseISO(dateString) : dateString;
  if (!date) return null;
  const result = formatDistanceToNow(date, { addSuffix: true });
  return <span>{result.toUpperCase()}</span>;
};

export default DateDifferenceComponent;