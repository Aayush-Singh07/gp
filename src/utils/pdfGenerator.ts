import jsPDF from 'jspdf';
import { Language, translations } from '../types/language';

interface ComplaintData {
  issueType: string;
  personalInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    incidentDate: string;
    incidentLocation: string;
    description: string;
  };
  documentsChecked: string[];
}

export const generateComplaintPDF = (
  complaintData: ComplaintData,
  tokenNumber: string,
  language: Language,
  totalDocuments: number
) => {
  const t = translations[language];
  const doc = new jsPDF();
  
  // Set font for better text rendering
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(25, 25, 112); // Dark blue
  doc.text(t.goaPolice, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(t.aiVisitorAssistant, 105, 30, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(t.complaintFiling, 105, 45, { align: 'center' });
  
  // Token Number
  doc.setFontSize(12);
  doc.setTextColor(25, 25, 112);
  doc.text(`${t.yourTokenNumber} ${tokenNumber}`, 105, 55, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Generated on: ${currentDate}`, 105, 65, { align: 'center' });
  
  let yPosition = 80;
  
  // Complaint Type
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(t.complaintType, 20, yPosition);
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(complaintData.issueType, 20, yPosition + 10);
  yPosition += 25;
  
  // Personal Information
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(t.personalInformation, 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  // Name
  doc.text(`${t.name} ${complaintData.personalInfo.name}`, 20, yPosition);
  yPosition += 10;
  
  // Phone
  doc.text(`${t.phone} ${complaintData.personalInfo.phone}`, 20, yPosition);
  yPosition += 10;
  
  // Email
  if (complaintData.personalInfo.email) {
    doc.text(`${t.email} ${complaintData.personalInfo.email}`, 20, yPosition);
    yPosition += 10;
  }
  
  // Address
  doc.text(`${t.address.replace(' *', ':')}`, 20, yPosition);
  yPosition += 8;
  const addressLines = doc.splitTextToSize(complaintData.personalInfo.address, 170);
  doc.text(addressLines, 20, yPosition);
  yPosition += addressLines.length * 6 + 10;
  
  // Incident Details
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(t.incidentDetails, 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  // Incident Date
  doc.text(`${t.date} ${complaintData.personalInfo.incidentDate}`, 20, yPosition);
  yPosition += 10;
  
  // Incident Location
  doc.text(`${t.location} ${complaintData.personalInfo.incidentLocation}`, 20, yPosition);
  yPosition += 10;
  
  // Description
  doc.text(`${t.description}`, 20, yPosition);
  yPosition += 8;
  const descriptionLines = doc.splitTextToSize(complaintData.personalInfo.description, 170);
  doc.text(descriptionLines, 20, yPosition);
  yPosition += descriptionLines.length * 6 + 15;
  
  // Documents
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(t.documentsAvailable, 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`${complaintData.documentsChecked.length} ${t.outOf} ${totalDocuments} ${t.documentsChecked}`, 20, yPosition);
  yPosition += 15;
  
  // Documents List
  if (complaintData.documentsChecked.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Documents Available:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    complaintData.documentsChecked.forEach((doc_name) => {
      const docLines = doc.splitTextToSize(`• ${doc_name}`, 170);
      doc.text(docLines, 25, yPosition);
      yPosition += docLines.length * 5 + 3;
    });
  }
  
  // Footer
  yPosition = 280;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated document. No signature is required.', 105, yPosition, { align: 'center' });
  doc.text(`${t.goaPolice} - ${t.aiVisitorAssistant}`, 105, yPosition + 8, { align: 'center' });
  
  // Save the PDF
  doc.save(`${tokenNumber}.pdf`);
};