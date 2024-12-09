import * as XLSX from 'xlsx';

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        console.log('Raw Excel data:', jsonData);

        const formattedData = jsonData.map((row, index) => {
          console.log('Row data:', row);
          
          return {
            id: index + 1,
            // Exactly match your column names with spaces
            firstName: row['First name'] || '',
            lastName: row['Last name'] || '',
            email: row['Email'] || '',
            status: 'Registered'
          };
        });

        console.log('Formatted attendees:', formattedData);
        
        resolve(formattedData);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Error parsing Excel file: ' + error.message));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};


export const generateExcel = (event) => {
  try {
    // Format data for export
    const exportData = event.attendees.map(attendee => ({
      'First Name': attendee.firstName,
      'Last Name': attendee.lastName,
      'Email': attendee.email,
      'Status': attendee.status,
      'Check-in Time': attendee.checkInTime || ''
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name}-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
};