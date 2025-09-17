import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Volume2 } from 'lucide-react';
import Header from './Header';
import VoiceInput from './VoiceInput';
import { Language, translations } from '../types/language';
import { generateComplaintPDF } from '../utils/pdfGenerator';
import { complaintsService } from '../lib/supabase';
import { generateReceipt } from '../utils/receiptGenerator';

interface ComplaintFilingProps {
  language: Language;
  onBack: () => void;
  onComplete: () => void;
}

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

const ComplaintFiling: React.FC<ComplaintFilingProps> = ({ language, onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = translations[language];
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [complaintData, setComplaintData] = useState<ComplaintData>({
    issueType: '',
    personalInfo: {
      name: '',
      phone: '',
      email: '',
      address: '',
      incidentDate: '',
      incidentLocation: '',
      description: ''
    },
    documentsChecked: []
  });

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices immediately if available
    loadVoices();

    // Also load when voices change (some browsers load them asynchronously)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const steps = [
    { number: 1, title: t.selectIssues },
    { number: 2, title: t.understandRights },
    { number: 3, title: t.fillInformation },
    { number: 4, title: t.documents },
    { number: 5, title: t.generateDrafts }
  ];

  const issueTypes = [
    t.theft,
    t.harassment,
    t.cybercrime,
    t.trafficViolation,
    t.pcc,
    t.others
  ];

  const rightsInfo = {
    [t.theft]: [
      language === 'english' ? 'You have the right to file an FIR (First Information Report)' :
      language === 'hindi' ? 'आपको एफआईआर (प्रथम सूचना रिपोर्ट) दर्ज करने का अधिकार है' :
      'तुमकां एफआयआर (प्रथम माहिती अहवाल) दाखल करपाचो हक्क आसा',
      
      language === 'english' ? 'Right to get a copy of the FIR' :
      language === 'hindi' ? 'एफआईआर की प्रति पाने का अधिकार' :
      'एफआयआराची प्रत मेळोवपाचो हक्क',
      
      language === 'english' ? 'Right to be informed about the progress of investigation' :
      language === 'hindi' ? 'जांच की प्रगति के बारे में जानकारी पाने का अधिकार' :
      'तपासाच्या प्रगतीविशीं माहिती मेळोवपाचो हक्क',
      
      language === 'english' ? 'Right to seek compensation through victim compensation scheme' :
      language === 'hindi' ? 'पीड़ित मुआवजा योजना के माध्यम से मुआवजा मांगने का अधिकार' :
      'पीडित नुकसानभरपाय योजनेंतल्यान नुकसानभरपाय मागपाचो हक्क',
      
      language === 'english' ? 'Right to legal aid if you cannot afford a lawyer' :
      language === 'hindi' ? 'यदि आप वकील का खर्च नहीं उठा सकते तो कानूनी सहायता का अधिकार' :
      'जर तुमकां वकीलाचो खर्च भरूंक शकना जाल्यार कायदेशीर मदतीचो हक्क'
    ],
    [t.harassment]: [
      language === 'english' ? 'You have the right to file a complaint under relevant sections' :
      language === 'hindi' ? 'आपको संबंधित धाराओं के तहत शिकायत दर्ज करने का अधिकार है' :
      'तुमकां संबंधित कलमांखाला शिकायत दाखल करपाचो हक्क आसा',
      
      language === 'english' ? 'Right to protection and safety measures' :
      language === 'hindi' ? 'सुरक्षा और सुरक्षा उपायों का अधिकार' :
      'सुरक्षा आनी सुरक्षा उपायांचो हक्क',
      
      language === 'english' ? 'Right to confidentiality during investigation' :
      language === 'hindi' ? 'जांच के दौरान गोपनीयता का अधिकार' :
      'तपासा वेळार गुप्ततायेचो हक्क',
      
      language === 'english' ? 'Right to be treated with dignity and respect' :
      language === 'hindi' ? 'गरिमा और सम्मान के साथ व्यवहार का अधिकार' :
      'मान-सन्मानान वागणूक मेळोवपाचो हक्क',
      
      language === 'english' ? 'Right to legal assistance and counseling support' :
      language === 'hindi' ? 'कानूनी सहायता और परामर्श सहायता का अधिकार' :
      'कायदेशीर मदत आनी सल्लामसलत मदतीचो हक्क'
    ],
    [t.cybercrime]: [
      language === 'english' ? 'You have the right to report cybercrime to cyber cell' :
      language === 'hindi' ? 'आपको साइबर सेल में साइबर अपराध की रिपोर्ट करने का अधिकार है' :
      'तुमकां सायबर सेलांत सायबर गुन्ह्याची तक्रार करपाचो हक्क आसा',
      
      language === 'english' ? 'Right to preserve digital evidence' :
      language === 'hindi' ? 'डिजिटल साक्ष्य संरक्षित करने का अधिकार' :
      'डिजिटल पुरावे जतन करपाचो हक्क',
      
      language === 'english' ? 'Right to get technical assistance for evidence collection' :
      language === 'hindi' ? 'साक्ष्य संग्रह के लिए तकनीकी सहायता पाने का अधिकार' :
      'पुरावे एकठांय करपाखातीर तंत्रगिन्यान मदत मेळोवपाचो हक्क',
      
      language === 'english' ? 'Right to privacy protection during investigation' :
      language === 'hindi' ? 'जांच के दौरान गोपनीयता सुरक्षा का अधिकार' :
      'तपासा वेळार गुप्ततायेच्या सुरक्षेचो हक्क',
      
      language === 'english' ? 'Right to compensation for financial losses' :
      language === 'hindi' ? 'वित्तीय नुकसान के लिए मुआवजे का अधिकार' :
      'आर्थिक नुकसानाखातीर नुकसानभरपायेचो हक्क'
    ],
    [t.trafficViolation]: [
      language === 'english' ? 'You have the right to contest the traffic challan' :
      language === 'hindi' ? 'आपको ट्रैफिक चालान का विरोध करने का अधिकार है' :
      'तुमकां ट्रॅफिक चलानाचो विरोध करपाचो हक्क आसा',
      
      language === 'english' ? 'Right to see evidence of the violation' :
      language === 'hindi' ? 'उल्लंघन के साक्ष्य देखने का अधिकार' :
      'उल्लंघनाचे पुरावे पळोवपाचो हक्क',
      
      language === 'english' ? 'Right to pay fine online or at designated centers' :
      language === 'hindi' ? 'ऑनलाइन या निर्दिष्ट केंद्रों पर जुर्माना भरने का अधिकार' :
      'ऑनलायन वा निर्दिष्ट केंद्रांनी दंड भरपाचो हक्क',
      
      language === 'english' ? 'Right to legal representation in traffic court' :
      language === 'hindi' ? 'ट्रैफिक कोर्ट में कानूनी प्रतिनिधित्व का अधिकार' :
      'ट्रॅफिक कोर्टांत कायदेशीर प्रतिनिधित्वाचो हक्क',
      
      language === 'english' ? 'Right to appeal against traffic court decisions' :
      language === 'hindi' ? 'ट्रैफिक कोर्ट के फैसलों के खिलाफ अपील का अधिकार' :
      'ट्रॅफिक कोर्टाच्या निर्णयांविरुद्ध अपील करपाचो हक्क'
    ],
    [t.others]: [
      language === 'english' ? 'You have the right to file a complaint for any legal issue' :
      language === 'hindi' ? 'आपको किसी भी कानूनी मुद्दे के लिए शिकायत दर्ज करने का अधिकार है' :
      'तुमकां खंयच्याय कायदेशीर मुद्द्याखातीर शिकायत दाखल करपाचो हक्क आसा',
      
      language === 'english' ? 'Right to fair investigation of your complaint' :
      language === 'hindi' ? 'आपकी शिकायत की निष्पक्ष जांच का अधिकार' :
      'तुमच्या शिकायतीच्या निष्पक्ष तपासाचो हक्क',
      
      language === 'english' ? 'Right to get information about applicable laws' :
      language === 'hindi' ? 'लागू कानूनों के बारे में जानकारी पाने का अधिकार' :
      'लागू कायद्यांविशीं माहिती मेळोवपाचो हक्क',
      
      language === 'english' ? 'Right to seek legal advice and representation' :
      language === 'hindi' ? 'कानूनी सलाह और प्रतिनिधित्व मांगने का अधिकार' :
      'कायदेशीर सल्लो आनी प्रतिनिधित्व मागपाचो हक्क',
      
      language === 'english' ? 'Right to follow up on your complaint status' :
      language === 'hindi' ? 'आपकी शिकायत की स्थिति का अनुसरण करने का अधिकार' :
      'तुमच्या शिकायतीच्या स्थितीचो पाठपुरावो करपाचो हक्क'
    ]
  };

  const requiredDocuments = {
    [t.theft]: [
      language === 'english' ? 'Identity Proof (Aadhaar Card/Passport/Driving License)' :
      language === 'hindi' ? 'पहचान प्रमाण (आधार कार्ड/पासपोर्ट/ड्राइविंग लाइसेंस)' :
      'वळख पुरावो (आधार कार्ड/पासपोर्ट/ड्रायव्हिंग लायसन्स)',
      
      language === 'english' ? 'Address Proof' :
      language === 'hindi' ? 'पता प्रमाण' :
      'पत्त्याचो पुरावो',
      
      language === 'english' ? 'List of stolen items with approximate value' :
      language === 'hindi' ? 'चोरी हुई वस्तुओं की सूची अनुमानित मूल्य के साथ' :
      'चोरी जाल्ल्या वस्तूंची वळेरी अंदाजीत किमतीसयत',
      
      language === 'english' ? 'Purchase receipts/bills of stolen items (if available)' :
      language === 'hindi' ? 'चोरी हुई वस्तुओं की खरीदारी रसीदें/बिल (यदि उपलब्ध हो)' :
      'चोरी जाल्ल्या वस्तूंच्या खरेदीच्या पावत्या/बिलां (उपलब्ध आसल्यार)',
      
      language === 'english' ? 'Photographs of the crime scene (if available)' :
      language === 'hindi' ? 'अपराध स्थल की तस्वीरें (यदि उपलब्ध हो)' :
      'गुन्ह्याच्या जाग्याचे फोटो (उपलब्ध आसल्यार)',
      
      language === 'english' ? 'Witness contact details (if any)' :
      language === 'hindi' ? 'गवाहों के संपर्क विवरण (यदि कोई हो)' :
      'साक्षीदारांचे संपर्क तपशील (आसल्यार)'
    ],
    [t.harassment]: [
      language === 'english' ? 'Identity Proof (Aadhaar Card/Passport/Driving License)' :
      language === 'hindi' ? 'पहचान प्रमाण (आधार कार्ड/पासपोर्ट/ड्राइविंग लाइसेंस)' :
      'वळख पुरावो (आधार कार्ड/पासपोर्ट/ड्रायव्हिंग लायसन्स)',
      
      language === 'english' ? 'Address Proof' :
      language === 'hindi' ? 'पता प्रमाण' :
      'पत्त्याचो पुरावो',
      
      language === 'english' ? 'Evidence of harassment (messages, emails, recordings)' :
      language === 'hindi' ? 'उत्पीड़न के साक्ष्य (संदेश, ईमेल, रिकॉर्डिंग)' :
      'छळवणुकीचे पुरावे (संदेश, ईमेल, रेकॉर्डिंग)',
      
      language === 'english' ? 'Medical reports (if physical harm caused)' :
      language === 'hindi' ? 'चिकित्सा रिपोर्ट (यदि शारीरिक नुकसान हुआ हो)' :
      'वैद्यकीय अहवाल (शारीरिक नुकसान जाल्यार)',
      
      language === 'english' ? 'Witness statements and contact details' :
      language === 'hindi' ? 'गवाहों के बयान और संपर्क विवरण' :
      'साक्षीदारांचे निवेदन आनी संपर्क तपशील',
      
      language === 'english' ? 'Previous complaints filed (if any)' :
      language === 'hindi' ? 'पहले दर्ज की गई शिकायतें (यदि कोई हो)' :
      'आदल्यो दाखल केल्ल्यो शिकायती (आसल्यार)'
    ],
    [t.cybercrime]: [
      language === 'english' ? 'Identity Proof (Aadhaar Card/Passport/Driving License)' :
      language === 'hindi' ? 'पहचान प्रमाण (आधार कार्ड/पासपोर्ट/ड्राइविंग लाइसेंस)' :
      'वळख पुरावो (आधार कार्ड/पासपोर्ट/ड्रायव्हिंग लायसन्स)',
      
      language === 'english' ? 'Screenshots of fraudulent messages/websites' :
      language === 'hindi' ? 'धोखाधड़ी संदेशों/वेबसाइटों के स्क्रीनशॉट' :
      'फसवणुकीच्या संदेशां/वेबसायटांचे स्क्रीनशॉट',
      
      language === 'english' ? 'Transaction details and bank statements' :
      language === 'hindi' ? 'लेनदेन विवरण और बैंक स्टेटमेंट' :
      'व्यवहाराचे तपशील आनी बँक स्टेटमेंट',
      
      language === 'english' ? 'Email headers and digital evidence' :
      language === 'hindi' ? 'ईमेल हेडर और डिजिटल साक्ष्य' :
      'ईमेल हेडर आनी डिजिटल पुरावे',
      
      language === 'english' ? 'Communication records with fraudsters' :
      language === 'hindi' ? 'धोखेबाजों के साथ संचार रिकॉर्ड' :
      'फसवणुकदारांकडेन संवादाचे रेकॉर्ड',
      
      language === 'english' ? 'Device information and IP addresses' :
      language === 'hindi' ? 'डिवाइस जानकारी और आईपी पते' :
      'उपकरणाची माहिती आनी आयपी पत्ते'
    ],
    [t.trafficViolation]: [
      language === 'english' ? 'Driving License' :
      language === 'hindi' ? 'ड्राइविंग लाइसेंस' :
      'ड्रायव्हिंग लायसन्स',
      
      language === 'english' ? 'Vehicle Registration Certificate (RC)' :
      language === 'hindi' ? 'वाहन पंजीकरण प्रमाणपत्र (आरसी)' :
      'वाहन नोंदणी प्रमाणपत्र (आरसी)',
      
      language === 'english' ? 'Insurance papers' :
      language === 'hindi' ? 'बीमा कागजात' :
      'विमा कागदपत्र',
      
      language === 'english' ? 'Video/photo evidence of the incident' :
      language === 'hindi' ? 'घटना के वीडियो/फोटो साक्ष्य' :
      'घटनेचे व्हिडिओ/फोटो पुरावे',
      
      language === 'english' ? 'Witness contact details' :
      language === 'hindi' ? 'गवाहों के संपर्क विवरण' :
      'साक्षीदारांचे संपर्क तपशील',
      
      language === 'english' ? 'Medical reports (in case of accident)' :
      language === 'hindi' ? 'चिकित्सा रिपोर्ट (दुर्घटना के मामले में)' :
      'वैद्यकीय अहवाल (अपघाताच्या बाबतींत)'
    ],
    [t.others]: [
      language === 'english' ? 'Identity Proof (Aadhaar Card/Passport/Driving License)' :
      language === 'hindi' ? 'पहचान प्रमाण (आधार कार्ड/पासपोर्ट/ड्राइविंग लाइसेंस)' :
      'वळख पुरावो (आधार कार्ड/पासपोर्ट/ड्रायव्हिंग लायसन्स)',
      
      language === 'english' ? 'Address Proof' :
      language === 'hindi' ? 'पता प्रमाण' :
      'पत्त्याचो पुरावो',
      
      language === 'english' ? 'Relevant supporting documents' :
      language === 'hindi' ? 'संबंधित सहायक दस्तावेज' :
      'संबंधित आधारभूत कागदपत्र',
      
      language === 'english' ? 'Evidence related to the complaint' :
      language === 'hindi' ? 'शिकायत से संबंधित साक्ष्य' :
      'शिकायतीशी संबंधित पुरावे',
      
      language === 'english' ? 'Witness contact details (if applicable)' :
      language === 'hindi' ? 'गवाहों के संपर्क विवरण (यदि लागू हो)' :
      'साक्षीदारांचे संपर्क तपशील (लागू आसल्यार)',
      
      language === 'english' ? 'Previous correspondence (if any)' :
      language === 'hindi' ? 'पिछला पत्राचार (यदि कोई हो)' :
      'आदलो पत्रव्यवहार (आसल्यार)'
    ]
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleIssueSelect = (issue: string) => {
    if (issue === t.others) {
      // Show input for custom issue
      const customIssue = prompt(
        language === 'english' ? 'Please describe your issue:' :
        language === 'hindi' ? 'कृपया अपनी समस्या का वर्णन करें:' :
        'कृपया तुमची समस्या वर्णन करा:'
      );
      if (customIssue) {
        setComplaintData({ ...complaintData, issueType: customIssue });
      }
    } else {
      setComplaintData({ ...complaintData, issueType: issue });
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setComplaintData({
      ...complaintData,
      personalInfo: { ...complaintData.personalInfo, [field]: value }
    });
  };

  const handleDocumentCheck = (document: string) => {
    const updatedDocs = complaintData.documentsChecked.includes(document)
      ? complaintData.documentsChecked.filter(doc => doc !== document)
      : [...complaintData.documentsChecked, document];
    
    setComplaintData({ ...complaintData, documentsChecked: updatedDocs });
  };

  const generateDraft = () => {
    const token = 'GP' + Math.random().toString().substr(2, 8).toUpperCase();
    setTokenNumber(token);
    
    // Save to database
    saveComplaintToDatabase(token);
    
    // Generate receipt instead of full PDF
    generateReceipt(token, 'complaint', complaintData.personalInfo.name, language);
    
    setShowTokenModal(true);
  };
  
  const saveComplaintToDatabase = async (token: string) => {
    try {
      // Translate complaint data to English for police
      const translatedData = {
        ...complaintData,
        issueType: translateToEnglish(complaintData.issueType),
        personalInfo: {
          ...complaintData.personalInfo,
          description: translateToEnglish(complaintData.personalInfo.description)
        }
      };
      
      await complaintsService.create({
        type: 'complaint',
        token_number: token,
        complainant_name: complaintData.personalInfo.name,
        complainant_phone: complaintData.personalInfo.phone,
        complaint_data: translatedData,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving complaint:', error);
    }
  };
  
  const translateToEnglish = (text: string): string => {
    // Simple translation mapping for common terms
    const translations: Record<string, string> = {
      'चोरी': 'Theft',
      'उत्पीड़न': 'Harassment',
      'साइबर अपराध': 'Cybercrime',
      'यातायात उल्लंघन': 'Traffic Violation',
      'पुलिस चरित्र प्रमाणपत्र (पीसीसी)': 'Police Clearance Certificate (PCC)',
      'छळवणूक': 'Harassment',
      'सायबर गुन्हा': 'Cybercrime',
      'वाहतूक उल्लंघन': 'Traffic Violation',
      'पोलिस चारित्र्य प्रमाणपत्र (पीसीसी)': 'Police Clearance Certificate (PCC)'
    };
    
    return translations[text] || text;
  };

  const speakRights = (rights: string[]) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create the text to speak
      const rightsText = rights.join('. ');
      const fullText = `${t.rightsFor} ${complaintData.issueType} ${t.complaint} ${rightsText}`;
      
      const utterance = new SpeechSynthesisUtterance(fullText);
      
      // Set voice based on language with better fallbacks
      let selectedVoice = null;
      
      if (language === 'english') {
        selectedVoice = voices.find(v => v.lang.startsWith('en-IN')) ||
                      voices.find(v => v.lang.startsWith('en-US')) ||
                      voices.find(v => v.lang.startsWith('en')) ||
                      voices.find(v => v.default);
      } else if (language === 'hindi' || language === 'konkani') {
        // Try Hindi voices first
        selectedVoice = voices.find(v => v.lang.startsWith('hi-IN')) ||
                      voices.find(v => v.lang.startsWith('hi')) ||
                      // Try other Indian languages as fallback
                      voices.find(v => v.lang.includes('IN') && v.lang !== 'en-IN') ||
                      // Fallback to other Indian languages
                      voices.find(v => v.lang.includes('IN')) ||
                      // Last resort - any available voice
                      voices.find(v => v.default) ||
                      voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
      } else {
        console.warn('No suitable voice found for language:', language);
      }
      
      utterance.rate = 0.8; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error('Speech synthesis error');
      };
      
      // Small delay to ensure voices are loaded
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      console.error('Speech synthesis not supported');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.selectIssues.replace('\n', ' ')}</h2>
            {issueTypes.map((issue) => (
              <div
                key={issue}
                onClick={() => handleIssueSelect(issue)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  complaintData.issueType === issue
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{issue}</span>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    complaintData.issueType === issue
                      ? 'bg-white border-white'
                      : 'border-gray-400'
                  }`}>
                    {complaintData.issueType === issue && (
                      <div className="w-full h-full rounded-full bg-yellow-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{t.yourRights}</h2>
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    const rights = rightsInfo[complaintData.issueType as keyof typeof rightsInfo];
                    if (rights) {
                      speakRights(rights);
                    }
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSpeaking 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                title={isSpeaking ? 
                  (language === 'english' ? 'Stop Reading' : 
                   language === 'hindi' ? 'पढ़ना बंद करें' : 'वाचप बंद करा') :
                  (language === 'english' ? 'Read Rights Aloud' : 
                   language === 'hindi' ? 'अधिकार जोर से पढ़ें' : 'हक्क मोठ्यान वाचा')
                }
              >
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                <span className="text-sm">
                  {isSpeaking ? 
                    (language === 'english' ? 'Stop' : 
                     language === 'hindi' ? 'बंद करें' : 'बंद करा') :
                    (language === 'english' ? 'Listen' : 
                     language === 'hindi' ? 'सुनें' : 'ऐका')
                  }
                </span>
              </button>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-blue-900">
                {t.rightsFor} {complaintData.issueType} {t.complaint}
              </h3>
              <ul className="space-y-3">
                {rightsInfo[complaintData.issueType as keyof typeof rightsInfo]?.map((right, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{right}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.fillInformation.replace('\n', ' ')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={complaintData.personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterFullName}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('name', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.phoneNumber}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="tel"
                    value={complaintData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterPhoneNumber}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('phone', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.address}</label>
                <div className="flex items-center space-x-2">
                  <textarea
                    value={complaintData.personalInfo.address}
                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder={t.enterCompleteAddress}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('address', complaintData.personalInfo.address + ' ' + text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.incidentDate}</label>
                <input
                  type="date"
                  value={complaintData.personalInfo.incidentDate}
                  onChange={(e) => handlePersonalInfoChange('incidentDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.incidentLocation}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={complaintData.personalInfo.incidentLocation}
                    onChange={(e) => handlePersonalInfoChange('incidentLocation', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterIncidentLocation}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('incidentLocation', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.descriptionOfIncident}</label>
                <div className="flex items-center space-x-2">
                  <textarea
                    value={complaintData.personalInfo.description}
                    onChange={(e) => handlePersonalInfoChange('description', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder={t.describeIncident}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('description', complaintData.personalInfo.description + ' ' + text)}
                    language={language}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.requiredDocuments}</h2>
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                {t.documentsNote}
              </p>
            </div>
            <div className="space-y-3">
              {requiredDocuments[complaintData.issueType as keyof typeof requiredDocuments]?.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => handleDocumentCheck(doc)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    complaintData.documentsChecked.includes(doc)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {complaintData.documentsChecked.includes(doc) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.previewGenerateDraft}</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">{t.complaintType}</h3>
                <p className="text-gray-600">{complaintData.issueType}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">{t.personalInformation}</h3>
                <div className="text-gray-600 space-y-1">
                  <p>{t.name} {complaintData.personalInfo.name}</p>
                  <p>{t.phone} {complaintData.personalInfo.phone}</p>
                  <p>{t.email} {complaintData.personalInfo.email}</p>
                  <p>{t.address.replace(' *', ':')} {complaintData.personalInfo.address}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">{t.incidentDetails}</h3>
                <div className="text-gray-600 space-y-1">
                  <p>{t.date} {complaintData.personalInfo.incidentDate}</p>
                  <p>{t.location} {complaintData.personalInfo.incidentLocation}</p>
                  <p>{t.description} {complaintData.personalInfo.description}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">{t.documentsAvailable}</h3>
                <p className="text-gray-600">{complaintData.documentsChecked.length} {t.outOf} {requiredDocuments[complaintData.issueType as keyof typeof requiredDocuments]?.length} {t.documentsChecked}</p>
              </div>
            </div>
            
            <button
              onClick={generateDraft}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {t.generateDraft}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header language={language} />
      
      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4">
          {/* Progress Header */}
          <div className="flex items-center mb-6">
            <button onClick={handleBack} className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{t.complaintFiling}</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.number
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-xs mt-2 max-w-16 leading-tight">
                    {step.title.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-blue-900' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !complaintData.issueType) ||
                (currentStep === 2 && !complaintData.issueType) ||
                (currentStep === 3 && (!complaintData.personalInfo.name || !complaintData.personalInfo.phone || !complaintData.personalInfo.address || !complaintData.personalInfo.incidentDate || !complaintData.personalInfo.incidentLocation || !complaintData.personalInfo.description))
              }
              className="w-full bg-blue-900 text-white py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {t.next}
            </button>
          )}
        </div>
      </div>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.draftGeneratedSuccess}</h3>
            <p className="text-gray-600 mb-4">{t.complaintDraftGenerated}</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">{t.yourTokenNumber}</p>
              <p className="text-2xl font-bold text-blue-900">{tokenNumber}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {t.saveTokenNote}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowTokenModal(false)}
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                {t.continue}
              </button>
              <button
                onClick={onComplete}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                {language === 'english' ? 'Exit' : language === 'hindi' ? 'बाहर निकलें' : 'बाहेर पडा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintFiling;