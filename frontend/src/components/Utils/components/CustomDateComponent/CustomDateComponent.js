import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const CustomDateComponent = ({ date }) => {
  const formattedDate = format(date, "MMM do, yyyy 'at' h:mm a", {
    locale: enUS,
  });
  return formattedDate;
};
export default CustomDateComponent;