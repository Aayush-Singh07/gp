import jsPDF from 'jspdf';
import { Language, translations } from '../types/language';

export const generateReceipt = (
  tokenNumber: string,
  type: 'complaint' | 'pcc' | 'women_complaint',
  complainantName: string,
  language: Language
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
  const title = type === 'complaint' ? 'COMPLAINT RECEIPT' :
                type === 'pcc' ? 'PCC APPLICATION RECEIPT' :
                type === 'women_complaint' ? 'WOMEN COMPLAINT RECEIPT' :
                'WOMEN OFFICER COMPLAINT RECEIPT';
  doc.text(title, 105, 50, { align: 'center' });
  
  // Receipt Box
  doc.setDrawColor(25, 25, 112);
  doc.setLineWidth(2);
  doc.rect(20, 70, 170, 100);
  
  // Token Number (Large)
  doc.setFontSize(24);
  doc.setTextColor(25, 25, 112);
  doc.text('TOKEN NUMBER', 105, 90, { align: 'center' });
  
  doc.setFontSize(32);
  doc.setTextColor(0, 0, 0);
  doc.text(tokenNumber, 105, 110, { align: 'center' });
  
  // Details
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  
  let yPosition = 130;
  
  // Name
  doc.text(`Name: ${complainantName}`, 30, yPosition);
  yPosition += 10;
  
  // Type
  const typeText = type === 'complaint' ? t.fileComplaint :
                   type === 'pcc' ? t.pcc :
                   type === 'women_complaint' ? 
                   (language === 'english' ? 'Women Officer Section' : 
                    language === 'hindi' ? 'महिला अधिकारी अनुभाग' : 'महिला अधिकारी विभाग') :
                   language === 'english' ? 'Women Officer Section' : 
                   language === 'hindi' ? 'महिला अधिकारी अनुभाग' : 'महिला अधिकारी विभाग';
  doc.text(`${language === 'english' ? 'Type:' : language === 'hindi' ? 'प्रकार:' : 'प्रकार:'} ${typeText}`, 30, yPosition);
  yPosition += 10;
  
  // Date
  const currentDate = new Date().toLocaleDateString();
  doc.text(`${language === 'english' ? 'Date:' : language === 'hindi' ? 'दिनांक:' : 'तारीख:'} ${currentDate}`, 30, yPosition);
  yPosition += 10;
  
  // Time
  const currentTime = new Date().toLocaleTimeString();
  doc.text(`${language === 'english' ? 'Time:' : language === 'hindi' ? 'समय:' : 'वेळ:'} ${currentTime}`, 30, yPosition);
  
  // Instructions
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const instruction1 = language === 'english' ? 'Please save this receipt for your records.' :
                      language === 'hindi' ? 'कृपया इस रसीद को अपने रिकॉर्ड के लिए सहेजें।' :
                      'कृपया ही पावती तुमच्या नोंदीसाठी जतन करा।';
  const instruction2 = language === 'english' ? 'You can use the token number to track your application status.' :
                      language === 'hindi' ? 'आप टोकन नंबर का उपयोग करके अपने आवेदन की स्थिति ट्रैक कर सकते हैं।' :
                      'तुम्ही टोकन नंबर वापरून तुमच्या अर्जाची स्थिती ट्रॅक करू शकता।';
  
  doc.text(instruction1, 105, 190, { align: 'center' });
  doc.text(instruction2, 105, 200, { align: 'center' });
  
  // Footer
  doc.setFontSize(8);
  doc.text('This is a computer-generated receipt. No signature is required.', 105, 280, { align: 'center' });
  doc.text(`${t.goaPolice} - ${t.aiVisitorAssistant}`, 105, 288, { align: 'center' });
  
  // Save the PDF
  doc.save(`Receipt_${tokenNumber}.pdf`);
};