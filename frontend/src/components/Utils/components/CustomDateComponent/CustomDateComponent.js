import { enUS } from 'date-fns/locale';
import { format } from 'date-fns';

const CustomDateComponent = ({ date, formatType }) => {
  const formatShown = formatType === 'short' ? "MMM do, yyyy" : "MMM do, yyyy 'at' h:mm a";
  const formattedDate = format(date, formatShown, {
    locale: enUS,
  });
  return formattedDate;
};
export default CustomDateComponent;