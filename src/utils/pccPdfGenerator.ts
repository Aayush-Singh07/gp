import jsPDF from 'jspdf';
import { Language, translations } from '../types/language';

interface PCCData {
  pccType: string;
  purpose: string;
  personalInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    dateOfBirth: string;
    placeOfBirth: string;
    fatherName: string;
    motherName: string;
  };
  documentsChecked: string[];
}

// Translation function for PDF content (always in English)
const translateToEnglish = (text: string, language: Language): string => {
  if (language === 'english') return text;
  
  // Translation mappings for common terms
  const translations: Record<string, string> = {
    // PCC Types
    'रोजगार': 'Employment',
    'वीजा आवेदन': 'Visa Application',
    'आप्रवासन': 'Immigration',
    'शिक्षा': 'Education',
    'व्यापार लाइसेंस': 'Business License',
    'अन्य': 'Others',
    'नोकरी': 'Employment',
    'व्हिसा अर्ज': 'Visa Application',
    'स्थलांतर': 'Immigration',
    'शिक्षण': 'Education',
    'धंदो लायसन्स': 'Business License',
    'इतर': 'Others',
    
    // Documents
    'आधार कार्ड': 'Aadhaar Card',
    'पासपोर्ट साइज फोटो (2)': 'Passport Size Photographs (2)',
    'जन्म प्रमाण पत्र': 'Birth Certificate',
    'जन्म प्रमाणपत्र': 'Birth Certificate',
    'पता प्रमाण': 'Address Proof',
    'पत्त्याचो पुरावो': 'Address Proof',
    'पासपोर्ट (वीजा/आप्रवासन के लिए)': 'Passport (for visa/immigration)',
    'पासपोर्ट (व्हिसा/स्थलांतराखातीर)': 'Passport (for visa/immigration)',
    'नियुक्ति पत्र (रोजगार के लिए)': 'Employment Letter (for employment)',
    'नोकरीचे पत्र (नोकरीखातीर)': 'Employment Letter (for employment)'
  };
  
  return translations[text] || text;
};

export const generatePCCPDF = (
  pccData: PCCData,
  tokenNumber: string,
  language: Language,
  totalDocuments: number
) => {
  const t = translations['english']; // Always use English for PDF
  const doc = new jsPDF();
  
  // Set font for better text rendering
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(25, 25, 112); // Dark blue
  doc.text('GOA POLICE', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('AI Visitor Assistant', 105, 30, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('POLICE CLEARANCE CERTIFICATE APPLICATION', 105, 45, { align: 'center' });
  
  // Token Number
  doc.setFontSize(12);
  doc.setTextColor(25, 25, 112);
  doc.text(`PCC Token Number: ${tokenNumber}`, 105, 55, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Generated on: ${currentDate}`, 105, 65, { align: 'center' });
  
  let yPosition = 80;
  
  // PCC Type
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('PCC Type:', 20, yPosition);
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(translateToEnglish(pccData.pccType, language), 20, yPosition + 10);
  yPosition += 25;
  
  // Purpose
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Purpose:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  const purposeLines = doc.splitTextToSize(pccData.purpose, 170);
  doc.text(purposeLines, 20, yPosition);
  yPosition += purposeLines.length * 6 + 15;
  
  // Personal Information
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Personal Information:', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  // Name
  doc.text(`Name: ${pccData.personalInfo.name}`, 20, yPosition);
  yPosition += 10;
  
  // Phone
  doc.text(`Phone: ${pccData.personalInfo.phone}`, 20, yPosition);
  yPosition += 10;
  
  // Email
  if (pccData.personalInfo.email) {
    doc.text(`Email: ${pccData.personalInfo.email}`, 20, yPosition);
    yPosition += 10;
  }
  
  // Date of Birth
  doc.text(`Date of Birth: ${pccData.personalInfo.dateOfBirth}`, 20, yPosition);
  yPosition += 10;
  
  // Place of Birth
  doc.text(`Place of Birth: ${pccData.personalInfo.placeOfBirth}`, 20, yPosition);
  yPosition += 10;
  
  // Father's Name
  doc.text(`Father's Name: ${pccData.personalInfo.fatherName}`, 20, yPosition);
  yPosition += 10;
  
  // Mother's Name
  doc.text(`Mother's Name: ${pccData.personalInfo.motherName}`, 20, yPosition);
  yPosition += 10;
  
  // Address
  doc.text('Address:', 20, yPosition);
  yPosition += 8;
  const addressLines = doc.splitTextToSize(pccData.personalInfo.address, 170);
  doc.text(addressLines, 20, yPosition);
  yPosition += addressLines.length * 6 + 15;
  
  // Documents
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Documents Available:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`${pccData.documentsChecked.length} out of ${totalDocuments} documents checked`, 20, yPosition);
  yPosition += 15;
  
  // Documents List
  if (pccData.documentsChecked.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Documents Submitted:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    pccData.documentsChecked.forEach((doc_name) => {
      const translatedDoc = translateToEnglish(doc_name, language);
      const docLines = doc.splitTextToSize(`• ${translatedDoc}`, 170);
      doc.text(docLines, 25, yPosition);
      yPosition += docLines.length * 5 + 3;
    });
  }
  
  // Footer
  yPosition = 280;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated document. No signature is required.', 105, yPosition, { align: 'center' });
  doc.text('GOA POLICE - AI Visitor Assistant', 105, yPosition + 8, { align: 'center' });
  
  // Save the PDF
  doc.save(`${tokenNumber}.pdf`);
};