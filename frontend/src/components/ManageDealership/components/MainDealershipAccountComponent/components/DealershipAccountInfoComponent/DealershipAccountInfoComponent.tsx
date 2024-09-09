import React from 'react';

import styles from './DealershipAccountInfoComponent.css';

export interface DealershipAccountInfoComponentProps {
  prop?: string;
}

export function DealershipAccountInfoComponent({prop = 'default value'}: DealershipAccountInfoComponentProps) {
  return <div className={styles.DealershipAccountInfoComponent}>DealershipAccountInfoComponent {prop}</div>;
}
