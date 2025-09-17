import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, FileText, Shield, Car, Home, Users, CreditCard, Phone, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Language, translations } from '../types/language';

interface GetInformationProps {
  language: Language;
  onBack: () => void;
  accessibilityMode: boolean;
}

interface QueryInfo {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  rights: string[];
  steps: string[];
  documents: string[];
}

const GetInformation: React.FC<GetInformationProps> = ({ language, onBack, accessibilityMode }) => {
  const [selectedQuery, setSelectedQuery] = useState<QueryInfo | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = translations[language];

  const commonQueries: QueryInfo[] = [
    {
      id: 'house-theft',
      title: language === 'english' ? 'House Theft' : language === 'hindi' ? 'घर की चोरी' : 'घराची चोरी',
      icon: Home,
      color: 'from-red-500 to-red-600',
      rights: [
        language === 'english' ? 'Right to file FIR immediately' : language === 'hindi' ? 'तुरंत एफआईआर दर्ज करने का अधिकार' : 'ताबडतोब एफआयआर दाखल करपाचो हक्क',
        language === 'english' ? 'Right to get copy of FIR' : language === 'hindi' ? 'एफआईआर की प्रति पाने का अधिकार' : 'एफआयआराची प्रत मेळोवपाचो हक्क',
        language === 'english' ? 'Right to investigation updates' : language === 'hindi' ? 'जांच की जानकारी पाने का अधिकार' : 'तपासाची माहिती मेळोवपाचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Report immediately to nearest police station' : language === 'hindi' ? 'निकटतम पुलिस स्टेशन में तुरंत रिपोर्ट करें' : 'लागींच्या पोलिस स्टेशनांत ताबडतोब रिपोर्ट करा',
        language === 'english' ? 'File detailed FIR with stolen items list' : language === 'hindi' ? 'चोरी की वस्तुओं की सूची के साथ विस्तृत एफआईआर दर्ज करें' : 'चोरी जाल्ल्या वस्तूंची वळेरी सयत तपशीलवार एफआयआर दाखल करा',
        language === 'english' ? 'Provide evidence and witness details' : language === 'hindi' ? 'साक्ष्य और गवाह का विवरण दें' : 'पुरावे आनी साक्षीदारांचे तपशील द्या'
      ],
      documents: [
        language === 'english' ? 'Identity proof' : language === 'hindi' ? 'पहचान प्रमाण' : 'वळख पुरावो',
        language === 'english' ? 'Address proof' : language === 'hindi' ? 'पता प्रमाण' : 'पत्त्याचो पुरावो',
        language === 'english' ? 'List of stolen items with value' : language === 'hindi' ? 'चोरी की वस्तुओं की सूची और मूल्य' : 'चोरी जाल्ल्या वस्तूंची वळेरी आनी किमत'
      ]
    },
    {
      id: 'assault',
      title: language === 'english' ? 'Physical Assault' : language === 'hindi' ? 'शारीरिक हमला' : 'शारीरिक हल्लो',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      rights: [
        language === 'english' ? 'Right to immediate medical aid' : language === 'hindi' ? 'तत्काल चिकित्सा सहायता का अधिकार' : 'ताबडतोब वैद्यकीय मदतीचो हक्क',
        language === 'english' ? 'Right to file complaint' : language === 'hindi' ? 'शिकायत दर्ज करने का अधिकार' : 'शिकायत दाखल करपाचो हक्क',
        language === 'english' ? 'Right to protection' : language === 'hindi' ? 'सुरक्षा का अधिकार' : 'सुरक्षेचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Seek immediate medical attention' : language === 'hindi' ? 'तुरंत चिकित्सा सहायता लें' : 'ताबडतोब वैद्यकीय मदत घ्या',
        language === 'english' ? 'Report to police with medical certificate' : language === 'hindi' ? 'मेडिकल सर्टिफिकेट के साथ पुलिस को रिपोर्ट करें' : 'वैद्यकीय प्रमाणपत्रासयत पोलिसांक रिपोर्ट करा',
        language === 'english' ? 'Identify witnesses and gather evidence' : language === 'hindi' ? 'गवाहों की पहचान करें और सबूत इकट्ठे करें' : 'साक्षीदारांची वळख करा आनी पुरावे एकठांय करा'
      ],
      documents: [
        language === 'english' ? 'Medical certificate' : language === 'hindi' ? 'मेडिकल सर्टिफिकेट' : 'वैद्यकीय प्रमाणपत्र',
        language === 'english' ? 'Identity proof' : language === 'hindi' ? 'पहचान प्रमाण' : 'वळख पुरावो',
        language === 'english' ? 'Witness contact details' : language === 'hindi' ? 'गवाह संपर्क विवरण' : 'साक्षीदारांचे संपर्क तपशील'
      ]
    },
    {
      id: 'pcc',
      title: language === 'english' ? 'Police Clearance Certificate' : language === 'hindi' ? 'पुलिस क्लीयरेंस सर्टिफिकेट' : 'पोलिस क्लिअरन्स सर्टिफिकेट',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      rights: [
        language === 'english' ? 'Right to apply for PCC' : language === 'hindi' ? 'पीसीसी के लिए आवेदन करने का अधिकार' : 'पीसीसीखातीर अर्ज करपाचो हक्क',
        language === 'english' ? 'Right to timely processing' : language === 'hindi' ? 'समय पर प्रसंस्करण का अधिकार' : 'वेळार प्रक्रिया करपाचो हक्क',
        language === 'english' ? 'Right to track application status' : language === 'hindi' ? 'आवेदन स्थिति ट्रैक करने का अधिकार' : 'अर्जाची स्थिती ट्रॅक करपाचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Fill PCC application form' : language === 'hindi' ? 'पीसीसी आवेदन फॉर्म भरें' : 'पीसीसी अर्जाचो फॉर्म भरा',
        language === 'english' ? 'Submit required documents' : language === 'hindi' ? 'आवश्यक दस्तावेज जमा करें' : 'गरजेचे कागदपत्र जमा करा',
        language === 'english' ? 'Pay prescribed fees' : language === 'hindi' ? 'निर्धारित शुल्क का भुगतान करें' : 'निर्धारीत फी भरा'
      ],
      documents: [
        language === 'english' ? 'Passport size photographs' : language === 'hindi' ? 'पासपोर्ट साइज फोटो' : 'पासपोर्ट साइज फोटो',
        language === 'english' ? 'Identity and address proof' : language === 'hindi' ? 'पहचान और पता प्रमाण' : 'वळख आनी पत्त्याचो पुरावो',
        language === 'english' ? 'Purpose declaration letter' : language === 'hindi' ? 'उद्देश्य घोषणा पत्र' : 'हेतू घोषणा पत्र'
      ]
    },
    {
      id: 'traffic-violation',
      title: language === 'english' ? 'Traffic Violation' : language === 'hindi' ? 'यातायात उल्लंघन' : 'वाहतूक उल्लंघन',
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      rights: [
        language === 'english' ? 'Right to see evidence of violation' : language === 'hindi' ? 'उल्लंघन के सबूत देखने का अधिकार' : 'उल्लंघनाचे पुरावे पळोवपाचो हक्क',
        language === 'english' ? 'Right to contest the challan' : language === 'hindi' ? 'चालान का विरोध करने का अधिकार' : 'चलानाचो विरोध करपाचो हक्क',
        language === 'english' ? 'Right to legal representation' : language === 'hindi' ? 'कानूनी प्रतिनिधित्व का अधिकार' : 'कायदेशीर प्रतिनिधित्वाचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Check challan details online' : language === 'hindi' ? 'ऑनलाइन चालान विवरण देखें' : 'ऑनलायन चलानाचे तपशील पळयात',
        language === 'english' ? 'Pay fine online or at designated centers' : language === 'hindi' ? 'ऑनलाइन या निर्दिष्ट केंद्रों पर जुर्माना भरें' : 'ऑनलायन वा निर्दिष्ट केंद्रांनी दंड भरा',
        language === 'english' ? 'Contest in traffic court if needed' : language === 'hindi' ? 'आवश्यकता पड़ने पर ट्रैफिक कोर्ट में विरोध करें' : 'गरज आसल्यार ट्रॅफिक कोर्टांत विरोध करा'
      ],
      documents: [
        language === 'english' ? 'Driving license' : language === 'hindi' ? 'ड्राइविंग लाइसेंस' : 'ड्रायव्हिंग लायसन्स',
        language === 'english' ? 'Vehicle registration' : language === 'hindi' ? 'वाहन पंजीकरण' : 'वाहन नोंदणी',
        language === 'english' ? 'Insurance papers' : language === 'hindi' ? 'बीमा कागजात' : 'विमा कागदपत्र'
      ]
    },
    {
      id: 'cyber-crime',
      title: language === 'english' ? 'Cyber Crime' : language === 'hindi' ? 'साइबर अपराध' : 'सायबर गुन्हा',
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      rights: [
        language === 'english' ? 'Right to report to cyber cell' : language === 'hindi' ? 'साइबर सेल में रिपोर्ट करने का अधिकार' : 'सायबर सेलांत रिपोर्ट करपाचो हक्क',
        language === 'english' ? 'Right to preserve digital evidence' : language === 'hindi' ? 'डिजिटल साक्ष्य संरक्षित करने का अधिकार' : 'डिजिटल पुरावे जतन करपाचो हक्क',
        language === 'english' ? 'Right to technical assistance' : language === 'hindi' ? 'तकनीकी सहायता का अधिकार' : 'तंत्रगिन्यान मदतीचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Do not delete any evidence' : language === 'hindi' ? 'कोई सबूत न मिटाएं' : 'खंयचेय पुरावे काडून उडयचे ना',
        language === 'english' ? 'Take screenshots of fraudulent messages' : language === 'hindi' ? 'धोखाधड़ी संदेशों के स्क्रीनशॉट लें' : 'फसवणुकीच्या संदेशांचे स्क्रीनशॉट घ्या',
        language === 'english' ? 'Report to cyber crime cell immediately' : language === 'hindi' ? 'तुरंत साइबर क्राइम सेल को रिपोर्ट करें' : 'ताबडतोब सायबर क्राइम सेलांक रिपोर्ट करा'
      ],
      documents: [
        language === 'english' ? 'Screenshots of fraud messages' : language === 'hindi' ? 'धोखाधड़ी संदेशों के स्क्रीनशॉट' : 'फसवणुकीच्या संदेशांचे स्क्रीनशॉट',
        language === 'english' ? 'Bank statements' : language === 'hindi' ? 'बैंक स्टेटमेंट' : 'बँक स्टेटमेंट',
        language === 'english' ? 'Transaction details' : language === 'hindi' ? 'लेनदेन विवरण' : 'व्यवहाराचे तपशील'
      ]
    },
    {
      id: 'domestic-violence',
      title: language === 'english' ? 'Domestic Violence' : language === 'hindi' ? 'घरेलू हिंसा' : 'घरगुती हिंसा',
      icon: AlertTriangle,
      color: 'from-pink-500 to-pink-600',
      rights: [
        language === 'english' ? 'Right to protection and safety' : language === 'hindi' ? 'सुरक्षा और संरक्षण का अधिकार' : 'सुरक्षा आनी संरक्षणाचो हक्क',
        language === 'english' ? 'Right to file complaint' : language === 'hindi' ? 'शिकायत दर्ज करने का अधिकार' : 'शिकायत दाखल करपाचो हक्क',
        language === 'english' ? 'Right to legal aid and counseling' : language === 'hindi' ? 'कानूनी सहायता और परामर्श का अधिकार' : 'कायदेशीर मदत आनी सल्लामसलतीचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Ensure immediate safety' : language === 'hindi' ? 'तत्काल सुरक्षा सुनिश्चित करें' : 'ताबडतोब सुरक्षा सुनिश्चित करा',
        language === 'english' ? 'Contact women helpline or police' : language === 'hindi' ? 'महिला हेल्पलाइन या पुलिस से संपर्क करें' : 'महिला हेल्पलायन वा पोलिसांशी संपर्क करा',
        language === 'english' ? 'File complaint with evidence' : language === 'hindi' ? 'सबूत के साथ शिकायत दर्ज करें' : 'पुराव्यांसयत शिकायत दाखल करा'
      ],
      documents: [
        language === 'english' ? 'Medical certificate (if injured)' : language === 'hindi' ? 'मेडिकल सर्टिफिकेट (यदि घायल हैं)' : 'वैद्यकीय प्रमाणपत्र (दुखापत आसल्यार)',
        language === 'english' ? 'Evidence of violence (photos, videos)' : language === 'hindi' ? 'हिंसा के सबूत (फोटो, वीडियो)' : 'हिंसेचे पुरावे (फोटो, व्हिडिओ)',
        language === 'english' ? 'Witness statements' : language === 'hindi' ? 'गवाह बयान' : 'साक्षीदारांचे निवेदन'
      ]
    },
    {
      id: 'missing-person',
      title: language === 'english' ? 'Missing Person' : language === 'hindi' ? 'लापता व्यक्ति' : 'बेपत्ता व्यक्ती',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      rights: [
        language === 'english' ? 'Right to file missing person report' : language === 'hindi' ? 'लापता व्यक्ति रिपोर्ट दर्ज करने का अधिकार' : 'बेपत्ता व्यक्तीची रिपोर्ट दाखल करपाचो हक्क',
        language === 'english' ? 'Right to immediate police action' : language === 'hindi' ? 'तत्काल पुलिस कार्रवाई का अधिकार' : 'ताबडतोब पोलिस कार्रवायेचो हक्क',
        language === 'english' ? 'Right to regular updates' : language === 'hindi' ? 'नियमित अपडेट का अधिकार' : 'नियमीत अपडेटाचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Report immediately to police' : language === 'hindi' ? 'तुरंत पुलिस को रिपोर्ट करें' : 'ताबडतोब पोलिसांक रिपोर्ट करा',
        language === 'english' ? 'Provide recent photograph and details' : language === 'hindi' ? 'हाल की तस्वीर और विवरण दें' : 'हालींचो फोटो आनी तपशील द्या',
        language === 'english' ? 'Check with hospitals and relatives' : language === 'hindi' ? 'अस्पतालों और रिश्तेदारों से जांच करें' : 'रुग्णालयां आनी नातेवायकांकडेन तपासा'
      ],
      documents: [
        language === 'english' ? 'Recent photograph' : language === 'hindi' ? 'हाल की तस्वीर' : 'हालींचो फोटो',
        language === 'english' ? 'Identity proof of missing person' : language === 'hindi' ? 'लापता व्यक्ति का पहचान प्रमाण' : 'बेपत्ता व्यक्तीचो वळख पुरावो',
        language === 'english' ? 'Last known location details' : language === 'hindi' ? 'अंतिम ज्ञात स्थान विवरण' : 'शेवटच्या वळखेच्या जाग्याचे तपशील'
      ]
    },
    {
      id: 'noise-complaint',
      title: language === 'english' ? 'Noise Complaint' : language === 'hindi' ? 'शोर की शिकायत' : 'आवाजाची शिकायत',
      icon: Volume2,
      color: 'from-teal-500 to-teal-600',
      rights: [
        language === 'english' ? 'Right to peaceful environment' : language === 'hindi' ? 'शांतिपूर्ण वातावरण का अधिकार' : 'शांत वातावरणाचो हक्क',
        language === 'english' ? 'Right to file noise complaint' : language === 'hindi' ? 'शोर की शिकायत दर्ज करने का अधिकार' : 'आवाजाची शिकायत दाखल करपाचो हक्क',
        language === 'english' ? 'Right to immediate action' : language === 'hindi' ? 'तत्काल कार्रवाई का अधिकार' : 'ताबडतोब कार्रवायेचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Try to resolve amicably first' : language === 'hindi' ? 'पहले मित्रतापूर्वक हल करने की कोशिश करें' : 'पयलीं मैत्रीपूर्ण रितीन सोडोवपाचो प्रयत्न करा',
        language === 'english' ? 'Document noise levels and timings' : language === 'hindi' ? 'शोर के स्तर और समय का दस्तावेजीकरण करें' : 'आवाजाची पातळी आनी वेळेची नोंद करा',
        language === 'english' ? 'File complaint with police' : language === 'hindi' ? 'पुलिस के पास शिकायत दर्ज करें' : 'पोलिसांकडेन शिकायत दाखल करा'
      ],
      documents: [
        language === 'english' ? 'Audio/video evidence' : language === 'hindi' ? 'ऑडियो/वीडियो सबूत' : 'ऑडिओ/व्हिडिओ पुरावे',
        language === 'english' ? 'Witness statements' : language === 'hindi' ? 'गवाह बयान' : 'साक्षीदारांचे निवेदन',
        language === 'english' ? 'Time log of disturbances' : language === 'hindi' ? 'परेशानी का समय लॉग' : 'त्रासाच्या वेळेची नोंद'
      ]
    },
    {
      id: 'property-dispute',
      title: language === 'english' ? 'Property Dispute' : language === 'hindi' ? 'संपत्ति विवाद' : 'मालमत्तेचो वाद',
      icon: Home,
      color: 'from-amber-500 to-amber-600',
      rights: [
        language === 'english' ? 'Right to legal remedy' : language === 'hindi' ? 'कानूनी उपचार का अधिकार' : 'कायदेशीर उपायाचो हक्क',
        language === 'english' ? 'Right to file complaint' : language === 'hindi' ? 'शिकायत दर्ज करने का अधिकार' : 'शिकायत दाखल करपाचो हक्क',
        language === 'english' ? 'Right to protection of property' : language === 'hindi' ? 'संपत्ति की सुरक्षा का अधिकार' : 'मालमत्तेच्या सुरक्षेचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Gather all property documents' : language === 'hindi' ? 'सभी संपत्ति दस्तावेज इकट्ठे करें' : 'सगळे मालमत्तेचे कागदपत्र एकठांय करा',
        language === 'english' ? 'Try mediation first' : language === 'hindi' ? 'पहले मध्यस्थता की कोशिश करें' : 'पयलीं मध्यस्थतायेचो प्रयत्न करा',
        language === 'english' ? 'File complaint if needed' : language === 'hindi' ? 'आवश्यकता पड़ने पर शिकायत दर्ज करें' : 'गरज आसल्यार शिकायत दाखल करा'
      ],
      documents: [
        language === 'english' ? 'Property title documents' : language === 'hindi' ? 'संपत्ति शीर्षक दस्तावेज' : 'मालमत्तेचे हक्काचे कागदपत्र',
        language === 'english' ? 'Sale deed/agreement' : language === 'hindi' ? 'बिक्री विलेख/समझौता' : 'विक्री विलेख/करार',
        language === 'english' ? 'Survey documents' : language === 'hindi' ? 'सर्वेक्षण दस्तावेज' : 'सर्वेक्षण कागदपत्र'
      ]
    },
    {
      id: 'vehicle-theft',
      title: language === 'english' ? 'Vehicle Theft' : language === 'hindi' ? 'वाहन चोरी' : 'वाहन चोरी',
      icon: Car,
      color: 'from-red-600 to-red-700',
      rights: [
        language === 'english' ? 'Right to file FIR immediately' : language === 'hindi' ? 'तुरंत एफआईआर दर्ज करने का अधिकार' : 'ताबडतोब एफआयआर दाखल करपाचो हक्क',
        language === 'english' ? 'Right to insurance claim' : language === 'hindi' ? 'बीमा दावे का अधिकार' : 'विमा दाव्याचो हक्क',
        language === 'english' ? 'Right to investigation' : language === 'hindi' ? 'जांच का अधिकार' : 'तपासाचो हक्क'
      ],
      steps: [
        language === 'english' ? 'Report theft immediately' : language === 'hindi' ? 'तुरंत चोरी की रिपोर्ट करें' : 'ताबडतोब चोरीची रिपोर्ट करा',
        language === 'english' ? 'File FIR with vehicle details' : language === 'hindi' ? 'वाहन विवरण के साथ एफआईआर दर्ज करें' : 'वाहनाच्या तपशीलांसयत एफआयआर दाखल करा',
        language === 'english' ? 'Inform insurance company' : language === 'hindi' ? 'बीमा कंपनी को सूचित करें' : 'विमा कंपनीक कळवा'
      ],
      documents: [
        language === 'english' ? 'Vehicle registration certificate' : language === 'hindi' ? 'वाहन पंजीकरण प्रमाणपत्र' : 'वाहन नोंदणी प्रमाणपत्र',
        language === 'english' ? 'Insurance papers' : language === 'hindi' ? 'बीमा कागजात' : 'विमा कागदपत्र',
        language === 'english' ? 'Driving license' : language === 'hindi' ? 'ड्राइविंग लाइसेंस' : 'ड्रायव्हिंग लायसन्स'
      ]
    }
  ];

  const speakContent = (content: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(content);
      
      // Set voice based on language
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (language === 'english') {
        selectedVoice = voices.find(v => v.lang.startsWith('en-IN')) ||
                      voices.find(v => v.lang.startsWith('en-US')) ||
                      voices.find(v => v.lang.startsWith('en'));
      } else if (language === 'hindi' || language === 'konkani') {
        selectedVoice = voices.find(v => v.lang.startsWith('hi-IN')) ||
                      voices.find(v => v.lang.startsWith('hi'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatContentForSpeech = (query: QueryInfo) => {
    const rightsText = query.rights.join('. ');
    const stepsText = query.steps.join('. ');
    const documentsText = query.documents.join(', ');
    
    return `${query.title}. ${language === 'english' ? 'Your rights:' : language === 'hindi' ? 'आपके अधिकार:' : 'तुमचे हक्क:'} ${rightsText}. ${language === 'english' ? 'Steps to follow:' : language === 'hindi' ? 'अनुसरण करने के चरण:' : 'अनुसरण करपाचे पावले:'} ${stepsText}. ${language === 'english' ? 'Required documents:' : language === 'hindi' ? 'आवश्यक दस्तावेज:' : 'गरजेचे कागदपत्र:'} ${documentsText}`;
  };

  if (selectedQuery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => setSelectedQuery(null)} className="mr-4">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                {selectedQuery.title}
              </h1>
            </div>
            
            <button
              onClick={() => speakContent(formatContentForSpeech(selectedQuery))}
              className={`bg-yellow-500 text-green-900 p-2 rounded-full hover:bg-yellow-400 transition-colors ${
                isSpeaking ? 'animate-pulse' : ''
              }`}
              title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Rights Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className={`font-bold text-green-800 mb-4 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {language === 'english' ? 'Your Rights' : language === 'hindi' ? 'आपके अधिकार' : 'तुमचे हक्क'}
            </h2>
            <div className="space-y-3">
              {selectedQuery.rights.map((right, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className={`text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>{right}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className={`font-bold text-blue-800 mb-4 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {language === 'english' ? 'Steps to Follow' : language === 'hindi' ? 'अनुसरण करने के चरण' : 'अनुसरण करपाचे पावले'}
            </h2>
            <div className="space-y-3">
              {selectedQuery.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className={`text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className={`font-bold text-purple-800 mb-4 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {language === 'english' ? 'Required Documents' : language === 'hindi' ? 'आवश्यक दस्तावेज' : 'गरजेचे कागदपत्र'}
            </h2>
            <div className="space-y-3">
              {selectedQuery.documents.map((document, index) => (
                <div key={index} className="flex items-start">
                  <FileText className="w-5 h-5 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                  <p className={`text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>{document}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-red-50 rounded-2xl shadow-xl p-6">
            <h2 className={`font-bold text-red-800 mb-4 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {language === 'english' ? 'Emergency Contacts' : language === 'hindi' ? 'आपातकालीन संपर्क' : 'तातकाळीन संपर्क'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-red-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {language === 'english' ? 'Police: 100' : language === 'hindi' ? 'पुलिस: 100' : 'पोलिस: 100'}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-red-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : ''}`}>
                  {language === 'english' ? 'Women Helpline: 1091' : language === 'hindi' ? 'महिला हेल्पलाइन: 1091' : 'महिला हेल्पलायन: 1091'}
                </span>
              </div>
            </div>
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
          <button onClick={onBack} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Info className="w-8 h-8 mr-3" />
            <div>
              <h1 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                {language === 'english' ? 'Get Information' : 
                 language === 'hindi' ? 'जानकारी प्राप्त करें' : 'माहिती मेळवा'}
              </h1>
              <p className={`text-green-200 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                {language === 'english' ? 'Common Legal Queries' : 
                 language === 'hindi' ? 'सामान्य कानूनी प्रश्न' : 'सामान्य कायदेशीर प्रश्न'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Query List */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {commonQueries.map((query) => {
            const IconComponent = query.icon;
            return (
              <button
                key={query.id}
                onClick={() => setSelectedQuery(query)}
                className={`bg-gradient-to-br ${query.color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white text-left ${
                  accessibilityMode ? 'p-8' : ''
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full mr-3">
                    <IconComponent className={accessibilityMode ? 'w-8 h-8' : 'w-6 h-6'} />
                  </div>
                  <h3 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                    {query.title}
                  </h3>
                </div>
                <p className={`opacity-90 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Tap to learn about your rights, steps, and required documents' :
                   language === 'hindi' ? 'अपने अधिकार, चरण और आवश्यक दस्तावेजों के बारे में जानने के लिए टैप करें' :
                   'तुमचे हक्क, पावले आनी गरजेचे कागदपत्रांविशीं जाणपाखातीर टॅप करा'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GetInformation;