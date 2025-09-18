import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { Language, translations } from '../types/language';
import VoiceInput from './VoiceInput';
import { generateReceipt } from '../utils/receiptGenerator';
import { complaintsService } from '../lib/supabase';

interface FileReportProps {
  language: Language;
  onBack: () => void;
  onComplete: () => void;
  accessibilityMode: boolean;
}

interface ReportData {
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

const FileReport: React.FC<FileReportProps> = ({ 
  language, 
  onBack, 
  onComplete, 
  accessibilityMode 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportData, setReportData] = useState<ReportData>({
    issueType: '',
    personalInfo: {
      name: '',
      phone: '',
      email: '',
      address: '',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentLocation: '',
      description: ''
    },
    documentsChecked: []
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = translations[language];

  const steps = [
    { number: 1, title: language === 'english' ? 'SELECT\nISSUE' : language === 'hindi' ? 'समस्या\nचुनें' : 'समस्या\nनिवडा' },
    { number: 2, title: language === 'english' ? 'UNDERSTAND\nPROCESS' : language === 'hindi' ? 'प्रक्रिया\nसमझें' : 'प्रक्रिया\nसमजा' },
    { number: 3, title: language === 'english' ? 'FILL\nINFORMATION' : language === 'hindi' ? 'जानकारी\nभरें' : 'माहिती\nभरा' },
    { number: 4, title: language === 'english' ? 'DOCUMENT\nCHECKLIST' : language === 'hindi' ? 'दस्तावेज\nसूची' : 'कागदपत्र\nयादी' },
    { number: 5, title: language === 'english' ? 'GENERATE\nDRAFT' : language === 'hindi' ? 'ड्राफ्ट\nबनाएं' : 'ड्राफ्ट\nतयार करा' }
  ];

  const issueTypes = [
    { id: 'theft', name: t.theft },
    { id: 'harassment', name: t.harassment },
    { id: 'cybercrime', name: t.cybercrime },
    { id: 'traffic', name: t.trafficViolation },
    { id: 'domestic', name: language === 'english' ? 'Domestic Violence' : language === 'hindi' ? 'घरेलू हिंसा' : 'घरगुती हिंसा' },
    { id: 'missing', name: language === 'english' ? 'Missing Person' : language === 'hindi' ? 'लापता व्यक्ति' : 'बेपत्ता व्यक्ती' },
    { id: 'noise', name: language === 'english' ? 'Noise Complaint' : language === 'hindi' ? 'शोर की शिकायत' : 'आवाजाची शिकायत' },
    { id: 'property', name: language === 'english' ? 'Property Dispute' : language === 'hindi' ? 'संपत्ति विवाद' : 'मालमत्तेचो वाद' },
    { id: 'other', name: t.others }
  ];

  const processInfo = {
    theft: {
      title: language === 'english' ? 'Theft Complaint Process' : language === 'hindi' ? 'चोरी शिकायत प्रक्रिया' : 'चोरी शिकायत प्रक्रिया',
      steps: [
        language === 'english' ? 'Report immediately to nearest police station' : language === 'hindi' ? 'निकटतम पुलिस स्टेशन में तुरंत रिपोर्ट करें' : 'लागींच्या पोलिस स्टेशनांत ताबडतोब रिपोर्ट करा',
        language === 'english' ? 'File detailed FIR with stolen items list' : language === 'hindi' ? 'चोरी की वस्तुओं की सूची के साथ विस्तृत एफआईआर दर्ज करें' : 'चोरी जाल्ल्या वस्तूंची वळेरी सयत तपशीलवार एफआयआर दाखल करा',
        language === 'english' ? 'Provide evidence and witness details' : language === 'hindi' ? 'साक्ष्य और गवाह का विवरण दें' : 'पुरावे आनी साक्षीदारांचे तपशील द्या',
        language === 'english' ? 'Follow up on investigation progress' : language === 'hindi' ? 'जांच की प्रगति का अनुसरण करें' : 'तपासाच्या प्रगतीचो पाठपुरावो करा'
      ]
    },
    harassment: {
      title: language === 'english' ? 'Harassment Complaint Process' : language === 'hindi' ? 'उत्पीड़न शिकायत प्रक्रिया' : 'छळवणूक शिकायत प्रक्रिया',
      steps: [
        language === 'english' ? 'Document all incidents with dates and details' : language === 'hindi' ? 'सभी घटनाओं को तारीख और विवरण के साथ दर्ज करें' : 'सगळ्यो घटना तारखे आनी तपशीलांसयत नोंदवा',
        language === 'english' ? 'Collect evidence (messages, emails, recordings)' : language === 'hindi' ? 'साक्ष्य एकत्र करें (संदेश, ईमेल, रिकॉर्डिंग)' : 'पुरावे एकठांय करा (संदेश, ईमेल, रेकॉर्डिंग)',
        language === 'english' ? 'File complaint with supporting evidence' : language === 'hindi' ? 'सहायक साक्ष्य के साथ शिकायत दर्ज करें' : 'आधारभूत पुराव्यांसयत शिकायत दाखल करा',
        language === 'english' ? 'Seek protection order if needed' : language === 'hindi' ? 'आवश्यकता पड़ने पर सुरक्षा आदेश मांगें' : 'गरज आसल्यार संरक्षण आदेश मागा'
      ]
    },
    cybercrime: {
      title: language === 'english' ? 'Cybercrime Complaint Process' : language === 'hindi' ? 'साइबर अपराध शिकायत प्रक्रिया' : 'सायबर गुन्हा शिकायत प्रक्रिया',
      steps: [
        language === 'english' ? 'Do not delete any digital evidence' : language === 'hindi' ? 'कोई डिजिटल साक्ष्य न मिटाएं' : 'खंयचेय डिजिटल पुरावे काडून उडयचे ना',
        language === 'english' ? 'Take screenshots of fraudulent content' : language === 'hindi' ? 'धोखाधड़ी सामग्री के स्क्रीनशॉट लें' : 'फसवणुकीच्या सामग्रीचे स्क्रीनशॉट घ्या',
        language === 'english' ? 'Report to cyber crime cell immediately' : language === 'hindi' ? 'तुरंत साइबर क्राइम सेल को रिपोर्ट करें' : 'ताबडतोब सायबर क्राइम सेलांक रिपोर्ट करा',
        language === 'english' ? 'Provide transaction and communication details' : language === 'hindi' ? 'लेनदेन और संचार विवरण प्रदान करें' : 'व्यवहार आनी संवाद तपशील द्या'
      ]
    },
    traffic: {
      title: language === 'english' ? 'Traffic Violation Process' : language === 'hindi' ? 'यातायात उल्लंघन प्रक्रिया' : 'वाहतूक उल्लंघन प्रक्रिया',
      steps: [
        language === 'english' ? 'Check challan details online' : language === 'hindi' ? 'ऑनलाइन चालान विवरण देखें' : 'ऑनलायन चलानाचे तपशील पळयात',
        language === 'english' ? 'Gather evidence if contesting' : language === 'hindi' ? 'विरोध करने पर साक्ष्य एकत्र करें' : 'विरोध करतना पुरावे एकठांय करा',
        language === 'english' ? 'Pay fine or contest in traffic court' : language === 'hindi' ? 'जुर्माना भरें या ट्रैफिक कोर्ट में विरोध करें' : 'दंड भरा वा ट्रॅफिक कोर्टांत विरोध करा',
        language === 'english' ? 'Keep payment receipt for records' : language === 'hindi' ? 'रिकॉर्ड के लिए भुगतान रसीद रखें' : 'नोंदीखातीर पेमेंट पावती दवरा'
      ]
    },
    domestic: {
      title: language === 'english' ? 'Domestic Violence Process' : language === 'hindi' ? 'घरेलू हिंसा प्रक्रिया' : 'घरगुती हिंसा प्रक्रिया',
      steps: [
        language === 'english' ? 'Ensure immediate safety' : language === 'hindi' ? 'तत्काल सुरक्षा सुनिश्चित करें' : 'ताबडतोब सुरक्षा सुनिश्चित करा',
        language === 'english' ? 'Seek medical attention if injured' : language === 'hindi' ? 'घायल होने पर चिकित्सा सहायता लें' : 'दुखापत आसल्यार वैद्यकीय मदत घ्या',
        language === 'english' ? 'Contact women helpline or police' : language === 'hindi' ? 'महिला हेल्पलाइन या पुलिस से संपर्क करें' : 'महिला हेल्पलायन वा पोलिसांशी संपर्क करा',
        language === 'english' ? 'File complaint with evidence' : language === 'hindi' ? 'सबूत के साथ शिकायत दर्ज करें' : 'पुराव्यांसयत शिकायत दाखल करा'
      ]
    },
    missing: {
      title: language === 'english' ? 'Missing Person Process' : language === 'hindi' ? 'लापता व्यक्ति प्रक्रिया' : 'बेपत्ता व्यक्ती प्रक्रिया',
      steps: [
        language === 'english' ? 'Report immediately to police' : language === 'hindi' ? 'तुरंत पुलिस को रिपोर्ट करें' : 'ताबडतोब पोलिसांक रिपोर्ट करा',
        language === 'english' ? 'Provide recent photograph and details' : language === 'hindi' ? 'हाल की तस्वीर और विवरण दें' : 'हालींचो फोटो आनी तपशील द्या',
        language === 'english' ? 'Check with hospitals and relatives' : language === 'hindi' ? 'अस्पतालों और रिश्तेदारों से जांच करें' : 'रुग्णालयां आनी नातेवायकांकडेन तपासा',
        language === 'english' ? 'Circulate information in community' : language === 'hindi' ? 'समुदाय में जानकारी प्रसारित करें' : 'समुदायांत माहिती पातळावा'
      ]
    },
    noise: {
      title: language === 'english' ? 'Noise Complaint Process' : language === 'hindi' ? 'शोर शिकायत प्रक्रिया' : 'आवाज शिकायत प्रक्रिया',
      steps: [
        language === 'english' ? 'Try to resolve amicably first' : language === 'hindi' ? 'पहले मित्रतापूर्वक हल करने की कोशिश करें' : 'पयलीं मैत्रीपूर्ण रितीन सोडोवपाचो प्रयत्न करा',
        language === 'english' ? 'Document noise levels and timings' : language === 'hindi' ? 'शोर के स्तर और समय का दस्तावेजीकरण करें' : 'आवाजाची पातळी आनी वेळेची नोंद करा',
        language === 'english' ? 'File complaint with police' : language === 'hindi' ? 'पुलिस के पास शिकायत दर्ज करें' : 'पोलिसांकडेन शिकायत दाखल करा',
        language === 'english' ? 'Provide evidence and witness details' : language === 'hindi' ? 'साक्ष्य और गवाह विवरण प्रदान करें' : 'पुरावे आनी साक्षीदार तपशील द्या'
      ]
    },
    property: {
      title: language === 'english' ? 'Property Dispute Process' : language === 'hindi' ? 'संपत्ति विवाद प्रक्रिया' : 'मालमत्ता वाद प्रक्रिया',
      steps: [
        language === 'english' ? 'Gather all property documents' : language === 'hindi' ? 'सभी संपत्ति दस्तावेज इकट्ठे करें' : 'सगळे मालमत्तेचे कागदपत्र एकठांय करा',
        language === 'english' ? 'Try mediation first' : language === 'hindi' ? 'पहले मध्यस्थता की कोशिश करें' : 'पयलीं मध्यस्थतायेचो प्रयत्न करा',
        language === 'english' ? 'File complaint if needed' : language === 'hindi' ? 'आवश्यकता पड़ने पर शिकायत दर्ज करें' : 'गरज आसल्यार शिकायत दाखल करा',
        language === 'english' ? 'Seek legal advice for complex cases' : language === 'hindi' ? 'जटिल मामलों के लिए कानूनी सलाह लें' : 'गुंतागुंतीच्या प्रकरणांखातीर कायदेशीर सल्लो घ्या'
      ]
    },
    other: {
      title: language === 'english' ? 'General Complaint Process' : language === 'hindi' ? 'सामान्य शिकायत प्रक्रिया' : 'सामान्य शिकायत प्रक्रिया',
      steps: [
        language === 'english' ? 'Clearly describe the issue' : language === 'hindi' ? 'समस्या का स्पष्ट वर्णन करें' : 'समस्येचे स्पष्ट वर्णन करा',
        language === 'english' ? 'Gather relevant evidence' : language === 'hindi' ? 'संबंधित साक्ष्य एकत्र करें' : 'संबंधित पुरावे एकठांय करा',
        language === 'english' ? 'File complaint with details' : language === 'hindi' ? 'विवरण के साथ शिकायत दर्ज करें' : 'तपशीलांसयत शिकायत दाखल करा',
        language === 'english' ? 'Follow up on progress' : language === 'hindi' ? 'प्रगति का अनुसरण करें' : 'प्रगतीचो पाठपुरावो करा'
      ]
    }
  };

  const requiredDocuments = {
    theft: [
      language === 'english' ? 'Identity Proof (Aadhaar/Passport/License)' : language === 'hindi' ? 'पहचान प्रमाण (आधार/पासपोर्ट/लाइसेंस)' : 'वळख पुरावो (आधार/पासपोर्ट/लायसन्स)',
      language === 'english' ? 'Address Proof' : language === 'hindi' ? 'पता प्रमाण' : 'पत्त्याचो पुरावो',
      language === 'english' ? 'List of stolen items with value' : language === 'hindi' ? 'चोरी की वस्तुओं की सूची और मूल्य' : 'चोरी जाल्ल्या वस्तूंची वळेरी आनी किमत',
      language === 'english' ? 'Purchase receipts (if available)' : language === 'hindi' ? 'खरीदारी रसीदें (यदि उपलब्ध)' : 'खरेदीच्या पावत्या (उपलब्ध आसल्यार)',
      language === 'english' ? 'Photographs of crime scene' : language === 'hindi' ? 'अपराध स्थल की तस्वीरें' : 'गुन्ह्याच्या जाग्याचे फोटो'
    ],
    harassment: [
      language === 'english' ? 'Identity Proof' : language === 'hindi' ? 'पहचान प्रमाण' : 'वळख पुरावो',
      language === 'english' ? 'Evidence of harassment (messages/emails)' : language === 'hindi' ? 'उत्पीड़न के साक्ष्य (संदेश/ईमेल)' : 'छळवणुकीचे पुरावे (संदेश/ईमेल)',
      language === 'english' ? 'Medical reports (if physical harm)' : language === 'hindi' ? 'चिकित्सा रिपोर्ट (शारीरिक नुकसान पर)' : 'वैद्यकीय अहवाल (शारीरिक नुकसान आसल्यार)',
      language === 'english' ? 'Witness statements' : language === 'hindi' ? 'गवाह बयान' : 'साक्षीदारांचे निवेदन'
    ],
    cybercrime: [
      language === 'english' ? 'Identity Proof' : language === 'hindi' ? 'पहचान प्रमाण' : 'वळख पुरावो',
      language === 'english' ? 'Screenshots of fraud' : language === 'hindi' ? 'धोखाधड़ी के स्क्रीनशॉट' : 'फसवणुकीचे स्क्रीनशॉट',
      language === 'english' ? 'Bank statements' : language === 'hindi' ? 'बैंक स्टेटमेंट' : 'बँक स्टेटमेंट',
      language === 'english' ? 'Transaction details' : language === 'hindi' ? 'लेनदेन विवरण' : 'व्यवहाराचे तपशील',
      language === 'english' ? 'Communication records' : language === 'hindi' ? 'संचार रिकॉर्ड' : 'संवादाचे रेकॉर्ड'
    ],
    traffic: [
      language === 'english' ? 'Driving License' : language === 'hindi' ? 'ड्राइविंग लाइसेंस' : 'ड्रायव्हिंग लायसन्स',
      language === 'english' ? 'Vehicle Registration (RC)' : language === 'hindi' ? 'वाहन पंजीकरण (आरसी)' : 'वाहन नोंदणी (आरसी)',
      language === 'english' ? 'Insurance papers' : language === 'hindi' ? 'बीमा कागजात' : 'विमा कागदपत्र',
      language === 'english' ? 'Evidence (photos/videos)' : language === 'hindi' ? 'साक्ष्य (फोटो/वीडियो)' : 'पुरावे (फोटो/व्हिडिओ)'
    ],
    domestic: [
      language === 'english' ? 'Identity Proof' : language === 'hindi' ? 'पहचान प्रमाण' : 'वळख पुरावो',
      language === 'english' ? 'Medical certificate (if injured)' : language === 'hindi' ? 'चिकित्सा प्रमाणपत्र (घायल होने पर)' : 'वैद्यकीय प्रमाणपत्र (दुखापत आसल्यार)',
      language === 'english' ? 'Evidence of violence' : language === 'hindi' ? 'हिंसा के सबूत' : 'हिंसेचे पुरावे',
      language === 'english' ? 'Witness statements' : language === 'hindi' ? 'गवाह बयान' : 'साक्षीदारांचे निवेदन'
    ],
    missing: [
      language === 'english' ? 'Recent photograph' : language === 'hindi' ? 'हाल की तस्वीर' : 'हालींचो फोटो',
      language === 'english' ? 'Identity proof of missing person' : language === 'hindi' ? 'लापता व्यक्ति का पहचान प्रमाण' : 'बेपत्ता व्यक्तीचो वळख पुरावो',
      language === 'english' ? 'Last known location details' : language === 'hindi' ? 'अंतिम ज्ञात स्थान विवरण' : 'शेवटच्या वळखेच्या जाग्याचे तपशील',
      language === 'english' ? 'Medical records (if applicable)' : language === 'hindi' ? 'चिकित्सा रिकॉर्ड (यदि लागू)' : 'वैद्यकीय नोंदी (लागू आसल्यार)'
    ],
    noise: [
      language === 'english' ? 'Identity Proof' : language === 'hindi' ? 'पहचान प्रमाण' : 'वळख पुरावो',
      language === 'english' ? 'Audio/video evidence' : language === 'hindi' ? 'ऑडियो/वीडियो साक्ष्य' : 'ऑडिओ/व्हिडिओ पुरावे',
      language === 'english' ? 'Time log of disturbances' : language === 'hindi' ? 'परेशानी का समय लॉग' : 'त्रासाच्या वेळेची नोंद',
      language === 'english' ? 'Witness contact details' : language === 'hindi' ? 'गवाह संपर्क विवरण' : 'साक्षीदारांचे संपर्क तपशील'
    ],
    property: [
      language === 'english' ? 'Property title documents' : language === 'hindi' ? 'संपत्ति शीर्षक दस्तावेज' : 'मालमत्तेचे हक्काचे कागदपत्र',
      language === 'english' ? 'Sale deed/agreement' : language === 'hindi' ? 'बिक्री विलेख/समझौता' : 'विक्री विलेख/करार',
      language === 'english' ? 'Survey documents' : language === 'hindi' ? 'सर्वेक्षण दस्तावेज' : 'सर्वेक्षण कागदपत्र',
      language === 'english' ? 'Identity proof of all parties' : language === 'hindi' ? 'सभी पक्षों का पहचान प्रमाण' : 'सगळ्या पक्षांचे वळख पुरावे'
    ],
    other: [
      language === 'english' ? 'Identity Proof' : language === 'hindi' ? 'पहचान प्रमाण' : 'वळख पुरावो',
      language === 'english' ? 'Relevant supporting documents' : language === 'hindi' ? 'संबंधित सहायक दस्तावेज' : 'संबंधित आधारभूत कागदपत्र',
      language === 'english' ? 'Evidence related to complaint' : language === 'hindi' ? 'शिकायत से संबंधित साक्ष्य' : 'शिकायतीशी संबंधित पुरावे',
      language === 'english' ? 'Witness details (if applicable)' : language === 'hindi' ? 'गवाह विवरण (यदि लागू)' : 'साक्षीदार तपशील (लागू आसल्यार)'
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

  const handleIssueSelect = (issueId: string) => {
    const issue = issueTypes.find(i => i.id === issueId);
    if (issue) {
      setReportData({ ...reportData, issueType: issue.name });
    }
  };

  const handleInputChange = (field: keyof ReportData['personalInfo'], value: string) => {
    setReportData({
      ...reportData,
      personalInfo: { ...reportData.personalInfo, [field]: value }
    });
  };

  const handleDocumentCheck = (document: string) => {
    const updatedDocs = reportData.documentsChecked.includes(document)
      ? reportData.documentsChecked.filter(doc => doc !== document)
      : [...reportData.documentsChecked, document];
    
    setReportData({ ...reportData, documentsChecked: updatedDocs });
  };

  const speakProcess = (steps: string[]) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);
      const text = steps.join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      let voice = null;
      
      if (language === 'english') {
        voice = voices.find(v => v.lang.startsWith('en-IN')) ||
               voices.find(v => v.lang.startsWith('en-US')) ||
               voices.find(v => v.lang.startsWith('en'));
      } else if (language === 'hindi' || language === 'konkani') {
        voice = voices.find(v => v.lang.startsWith('hi-IN')) ||
               voices.find(v => v.lang.startsWith('hi'));
      }
      
      if (voice) utterance.voice = voice;
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async () => {
    if (!reportData.issueType || !reportData.personalInfo.name || !reportData.personalInfo.phone || !reportData.personalInfo.description) {
      alert(language === 'english' ? 'Please fill all required fields' : 
            language === 'hindi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 
            'कृपया सगळे गरजेचे फील्ड भरा');
      return;
    }

    const token = Math.floor(10 + Math.random() * 90).toString(); // 2-digit token
    setTokenNumber(token);

    try {
      await complaintsService.create({
        type: 'complaint',
        token_number: token,
        complainant_name: reportData.personalInfo.name,
        complainant_phone: reportData.personalInfo.phone,
        complainant_email: reportData.personalInfo.email,
        complaint_data: {
          type: translateToEnglish(reportData.issueType),
          description: reportData.personalInfo.description,
          location: reportData.personalInfo.incidentLocation,
          date: reportData.personalInfo.incidentDate,
          documentsChecked: reportData.documentsChecked
        },
        status: 'pending'
      });

      generateReceipt(token, 'complaint', reportData.personalInfo.name, language);
      setShowReceipt(true);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const translateToEnglish = (type: string): string => {
    const typeMap: Record<string, string> = {
      'चोरी': 'Theft',
      'उत्पीड़न': 'Harassment', 
      'साइबर अपराध': 'Cybercrime',
      'यातायात उल्लंघन': 'Traffic Violation',
      'घरेलू हिंसा': 'Domestic Violence',
      'लापता व्यक्ति': 'Missing Person',
      'शोर की शिकायत': 'Noise Complaint',
      'संपत्ति विवाद': 'Property Dispute',
      'छळवणूक': 'Harassment',
      'सायबर गुन्हा': 'Cybercrime',
      'वाहतूक उल्लंघन': 'Traffic Violation',
      'घरगुती हिंसा': 'Domestic Violence',
      'बेपत्ता व्यक्ती': 'Missing Person',
      'आवाजाची शिकायत': 'Noise Complaint',
      'मालमत्तेचो वाद': 'Property Dispute'
    };
    return typeMap[type] || type;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className={`font-bold text-gray-800 mb-6 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
              {language === 'english' ? 'Select Issue Type' : 
               language === 'hindi' ? 'समस्या का प्रकार चुनें' : 
               'समस्येचो प्रकार निवडा'}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {issueTypes.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueSelect(issue.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    reportData.issueType === issue.name
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${accessibilityMode ? 'p-6 text-lg' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{issue.name}</span>
                    {reportData.issueType === issue.name && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        const selectedIssueId = issueTypes.find(i => i.name === reportData.issueType)?.id || 'other';
        const processData = processInfo[selectedIssueId as keyof typeof processInfo];
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-bold text-gray-800 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
                {language === 'english' ? 'Understand Process' : 
                 language === 'hindi' ? 'प्रक्रिया समझें' : 
                 'प्रक्रिया समजा'}
              </h2>
              <button
                onClick={() => speakProcess(processData.steps)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSpeaking 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="text-sm">
                  {isSpeaking ? 
                    (language === 'english' ? 'Stop' : language === 'hindi' ? 'बंद करें' : 'बंद करा') :
                    (language === 'english' ? 'Listen' : language === 'hindi' ? 'सुनें' : 'ऐका')
                  }
                </span>
              </button>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className={`font-semibold text-blue-900 mb-4 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                {processData.title}
              </h3>
              <div className="space-y-3">
                {processData.steps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className={`text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className={`font-bold text-gray-800 mb-6 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
              {language === 'english' ? 'Fill Information' : 
               language === 'hindi' ? 'जानकारी भरें' : 
               'माहिती भरा'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {t.fullName}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={reportData.personalInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      accessibilityMode ? 'p-4 text-lg' : 'p-3'
                    }`}
                    placeholder={t.enterFullName}
                  />
                  <VoiceInput
                    onTranscript={(text) => handleInputChange('name', text)}
                    language={language}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {t.phoneNumber}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="tel"
                    value={reportData.personalInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      accessibilityMode ? 'p-4 text-lg' : 'p-3'
                    }`}
                    placeholder={t.enterPhoneNumber}
                  />
                  <VoiceInput
                    onTranscript={(text) => handleInputChange('phone', text)}
                    language={language}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                {t.emailAddress}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={reportData.personalInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    accessibilityMode ? 'p-4 text-lg' : 'p-3'
                  }`}
                  placeholder={t.enterEmailAddress}
                />
                <VoiceInput
                  onTranscript={(text) => handleInputChange('email', text)}
                  language={language}
                />
              </div>
            </div>

            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                {t.address}
              </label>
              <div className="flex items-center space-x-2">
                <textarea
                  value={reportData.personalInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    accessibilityMode ? 'p-4 text-lg' : 'p-3'
                  }`}
                  rows={3}
                  placeholder={t.enterCompleteAddress}
                />
                <VoiceInput
                  onTranscript={(text) => handleInputChange('address', reportData.personalInfo.address + ' ' + text)}
                  language={language}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {t.incidentDate}
                </label>
                <input
                  type="date"
                  value={reportData.personalInfo.incidentDate}
                  onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    accessibilityMode ? 'p-4 text-lg' : 'p-3'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {t.incidentLocation}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={reportData.personalInfo.incidentLocation}
                    onChange={(e) => handleInputChange('incidentLocation', e.target.value)}
                    className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      accessibilityMode ? 'p-4 text-lg' : 'p-3'
                    }`}
                    placeholder={t.enterIncidentLocation}
                  />
                  <VoiceInput
                    onTranscript={(text) => handleInputChange('incidentLocation', text)}
                    language={language}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                {t.descriptionOfIncident}
              </label>
              <div className="flex items-start space-x-2">
                <textarea
                  value={reportData.personalInfo.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={accessibilityMode ? 6 : 4}
                  className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    accessibilityMode ? 'p-4 text-lg' : 'p-3'
                  }`}
                  placeholder={t.describeIncident}
                />
                <VoiceInput
                  onTranscript={(text) => handleInputChange('description', reportData.personalInfo.description + ' ' + text)}
                  language={language}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        const selectedIssueIdForDocs = issueTypes.find(i => i.name === reportData.issueType)?.id || 'other';
        const documents = requiredDocuments[selectedIssueIdForDocs as keyof typeof requiredDocuments] || [];
        
        return (
          <div className="space-y-4">
            <h2 className={`font-bold text-gray-800 mb-6 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
              {language === 'english' ? 'Document Checklist' : 
               language === 'hindi' ? 'दस्तावेज सूची' : 
               'कागदपत्र यादी'}
            </h2>
            
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className={`text-yellow-800 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                {language === 'english' ? 'Please check the documents you have available. You can still proceed without all documents.' : 
                 language === 'hindi' ? 'कृपया उपलब्ध दस्तावेजों को चेक करें। आप सभी दस्तावेजों के बिना भी आगे बढ़ सकते हैं।' : 
                 'कृपया उपलब्ध कागदपत्र चेक करा। तुम्ही सगळे कागदपत्र नासतना पण पुढे वचूं शकता.'}
              </p>
            </div>
            
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => handleDocumentCheck(doc)}
                  className={`flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                    accessibilityMode ? 'p-6' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded border-2 mr-3 flex items-center justify-center ${
                    reportData.documentsChecked.includes(doc)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {reportData.documentsChecked.includes(doc) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className={`font-bold text-gray-800 mb-6 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
              {language === 'english' ? 'Generate Draft' : 
               language === 'hindi' ? 'ड्राफ्ट बनाएं' : 
               'ड्राफ्ट तयार करा'}
            </h2>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <h3 className={`font-semibold text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {language === 'english' ? 'Issue Type:' : language === 'hindi' ? 'समस्या का प्रकार:' : 'समस्येचो प्रकार:'}
                </h3>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-lg' : ''}`}>{reportData.issueType}</p>
              </div>
              
              <div>
                <h3 className={`font-semibold text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {language === 'english' ? 'Personal Information:' : language === 'hindi' ? 'व्यक्तिगत जानकारी:' : 'व्यक्तिगत माहिती:'}
                </h3>
                <div className={`text-gray-600 space-y-1 ${accessibilityMode ? 'text-lg' : ''}`}>
                  <p>{t.name} {reportData.personalInfo.name}</p>
                  <p>{t.phone} {reportData.personalInfo.phone}</p>
                  {reportData.personalInfo.email && <p>{t.email} {reportData.personalInfo.email}</p>}
                  <p>{t.address.replace(' *', ':')} {reportData.personalInfo.address}</p>
                </div>
              </div>
              
              <div>
                <h3 className={`font-semibold text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {language === 'english' ? 'Incident Details:' : language === 'hindi' ? 'घटना विवरण:' : 'घटनेचे तपशील:'}
                </h3>
                <div className={`text-gray-600 space-y-1 ${accessibilityMode ? 'text-lg' : ''}`}>
                  <p>{t.date} {reportData.personalInfo.incidentDate}</p>
                  <p>{t.location} {reportData.personalInfo.incidentLocation}</p>
                  <p>{t.description} {reportData.personalInfo.description}</p>
                </div>
              </div>
              
              <div>
                <h3 className={`font-semibold text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {language === 'english' ? 'Documents Available:' : language === 'hindi' ? 'उपलब्ध दस्तावेज:' : 'उपलब्ध कागदपत्र:'}
                </h3>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {reportData.documentsChecked.length} {language === 'english' ? 'documents checked' : language === 'hindi' ? 'दस्तावेज चेक किए गए' : 'कागदपत्र चेक केले'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              className={`w-full bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors ${
                accessibilityMode ? 'py-6 text-xl' : 'py-4 text-lg'
              }`}
            >
              {language === 'english' ? 'Generate Draft' : 
               language === 'hindi' ? 'ड्राफ्ट बनाएं' : 
               'ड्राफ्ट तयार करा'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          
          <h2 className={`font-bold text-gray-800 mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
            {language === 'english' ? 'Report Filed Successfully!' : 
             language === 'hindi' ? 'रिपोर्ट सफलतापूर्वक दर्ज की गई!' : 
             'रिपोर्ट यशस्वीपणान दाखल जाली!'}
          </h2>
          
          <div className="bg-blue-50 p-6 rounded-xl mb-6">
            <p className={`text-gray-600 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Your Token Number:' : 
               language === 'hindi' ? 'आपका टोकन नंबर:' : 
               'तुमचो टोकन नंबर:'}
            </p>
            <p className={`font-bold text-blue-900 ${accessibilityMode ? 'text-3xl' : 'text-2xl'}`}>
              {tokenNumber}
            </p>
          </div>
          
          <p className={`text-gray-600 mb-6 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
            {language === 'english' ? 'Please save this token number. You can use it to track your report status.' : 
             language === 'hindi' ? 'कृपया इस टोकन नंबर को सेव करें। आप इसका उपयोग अपनी रिपोर्ट की स्थिति ट्रैक करने के लिए कर सकते हैं।' : 
             'कृपया हो टोकन नंबर सेव्ह करा. तुम्ही हाचो वापर तुमच्या रिपोर्टाची स्थिती ट्रॅक करपाखातीर करूं शकता.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onComplete}
              className={`w-full bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors ${
                accessibilityMode ? 'py-4 px-6 text-xl' : 'py-3 px-4'
              }`}
            >
              {language === 'english' ? 'Continue' : 
               language === 'hindi' ? 'जारी रखें' : 
               'चालू दवरा'}
            </button>
            
            <button
              onClick={onBack}
              className={`w-full bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors ${
                accessibilityMode ? 'py-4 px-6 text-xl' : 'py-3 px-4'
              }`}
            >
              {language === 'english' ? 'Back to Home' : 
               language === 'hindi' ? 'होम पर वापस' : 
               'घरा परत'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-4">
        <div className="flex items-center">
          <button onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
            {language === 'english' ? 'File Report' : 
             language === 'hindi' ? 'रिपोर्ट दर्ज करें' : 
             'रिपोर्ट दाखल करा'}
          </h1>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className={`text-xs mt-2 max-w-16 leading-tight ${accessibilityMode ? 'text-sm' : ''}`}>
                    {step.title.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
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
                (currentStep === 1 && !reportData.issueType) ||
                (currentStep === 3 && (!reportData.personalInfo.name || !reportData.personalInfo.phone || !reportData.personalInfo.address || !reportData.personalInfo.incidentDate || !reportData.personalInfo.incidentLocation || !reportData.personalInfo.description))
              }
              className={`w-full bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                accessibilityMode ? 'py-6 text-xl' : 'py-4 text-lg'
              }`}
            >
              {language === 'english' ? 'Next' : 
               language === 'hindi' ? 'आगे' : 
               'पुढे'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileReport;