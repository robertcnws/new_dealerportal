import React from 'react';

const CustomStatCardComponent = ({ title, value, icon }) => {
  return (
    <div className="stats-card"
      style={{
        backgroundColor: 'white',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        minHeight: 80, borderRadius: 5
      }}>
      <h6 style={{ padding: 10 }}>{title}</h6>
      <table>
        <tbody>
          <tr>
            <td style={{ width: '90%' }}><h3 style={{ paddingLeft: 10 }}><b>{value}</b></h3></td>
            <td style={{ textAlign: 'center', verticalAlign: 'middle', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={icon}
                style={{
                  padding: 10,
                  color: '#4CAF50',
                  fontSize: '25px'
                }}></i> {/* Cambia #4CAF50 por el color deseado */}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CustomStatCardComponent;