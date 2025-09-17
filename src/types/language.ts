export type Language = 'english' | 'hindi' | 'konkani';

export interface Translations {
  // Header
  goaPolice: string;
  aiVisitorAssistant: string;
  
  // Home Screen
  fileReport: string;
  fileReportSubtitle: string;
  getInformation: string;
  getInformationSubtitle: string;
  emergencyHelp: string;
  emergencyHelpSubtitle: string;
  translationAssistant: string;
  translationAssistantSubtitle: string;
  aiVoiceAssistant: string;
  tapToSpeak: string;
  listening: string;
  speaking: string;
  processing: string;
  aiWelcomeMessage: string;
  
  // Emergency Modal
  emergencyTitle: string;
  enterName: string;
  enterIssue: string;
  selectEmergencyIssue: string;
  medicalEmergency: string;
  fireEmergency: string;
  accidentEmergency: string;
  crimeInProgress: string;
  domesticViolence: string;
  kidnapping: string;
  robbery: string;
  others: string;
  next: string;
  sosTicketGenerated: string;
  yourSosTicketId: string;
  officerWillAssist: string;
  ok: string;
  
  // Complaint Filing
  complaintFiling: string;
  selectIssues: string;
  understandRights: string;
  fillInformation: string;
  documents: string;
  generateDrafts: string;
  
  // Issue Types
  theft: string;
  harassment: string;
  cybercrime: string;
  trafficViolation: string;
  pcc: string;
  
  // Rights
  yourRights: string;
  rightsFor: string;
  complaint: string;
  
  // Personal Information
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  incidentDate: string;
  incidentLocation: string;
  descriptionOfIncident: string;
  enterFullName: string;
  enterPhoneNumber: string;
  enterEmailAddress: string;
  enterCompleteAddress: string;
  enterIncidentLocation: string;
  describeIncident: string;
  
  // Documents
  requiredDocuments: string;
  documentsNote: string;
  
  // Preview
  previewGenerateDraft: string;
  complaintType: string;
  personalInformation: string;
  incidentDetails: string;
  documentsAvailable: string;
  outOf: string;
  documentsChecked: string;
  generateDraft: string;
  
  // Success
  draftGeneratedSuccess: string;
  complaintDraftGenerated: string;
  yourTokenNumber: string;
  saveTokenNote: string;
  continue: string;
  backToHome: string;
  
  // Common
  name: string;
  phone: string;
  email: string;
  date: string;
  location: string;
  description: string;
  fileComplaint: string;
  
  // PCC
  pccFiling: string;
  selectPccType: string;
  enterPurpose: string;
  pccTypes: {
    employment: string;
    visa: string;
    immigration: string;
    education: string;
    business: string;
    others: string;
  };
  purpose: string;
  enterPurposeDetails: string;
  pccPersonalInfo: string;
  pccDocuments: string;
  pccPreview: string;
  pccType: string;
  purposeDetails: string;
  pccDraftGenerated: string;
  yourPccTokenNumber: string;
  pccDraftGeneratedSuccess: string;
}

export const translations: Record<Language, Translations> = {
  english: {
    // Header
    goaPolice: 'GOA POLICE',
    aiVisitorAssistant: 'AI Visitor Assistant',
    
    // Home Screen
    fileReport: 'File Report',
    fileReportSubtitle: 'रिपोर्ट दर्ज / रिपोर्ट दाखल करा',
    getInformation: 'Get Information',
    getInformationSubtitle: 'जानकारी प्राप्त / माहिती मेळवा',
    emergencyHelp: 'Emergency Help',
    emergencyHelpSubtitle: 'आपातकालीन सहायता / तातकाळ मदत',
    translationAssistant: 'Translation Assistant',
    translationAssistantSubtitle: 'अनुवाद सहायक / भाषांतर सहाय्यक',
    aiVoiceAssistant: 'AI Voice Assistant',
    tapToSpeak: 'Tap to speak',
    listening: 'Listening...',
    speaking: 'Speaking...',
    processing: 'Processing...',
    aiWelcomeMessage: 'Hello! I am your AI assistant. How can I help you today?',
    
    // Emergency Modal
    emergencyTitle: 'Emergency Help',
    enterName: 'Enter Name',
    enterIssue: 'Enter Issue',
    selectEmergencyIssue: 'Select Emergency Issue',
    medicalEmergency: 'Medical Emergency',
    fireEmergency: 'Fire Emergency',
    accidentEmergency: 'Accident Emergency',
    crimeInProgress: 'Crime in Progress',
    domesticViolence: 'Domestic Violence',
    kidnapping: 'Kidnapping',
    robbery: 'Robbery',
    others: 'Others',
    next: 'NEXT',
    sosTicketGenerated: 'SOS Ticket Generated!',
    yourSosTicketId: 'Your SOS Ticket ID:',
    officerWillAssist: 'An officer will shortly assist you',
    ok: 'OK',
    
    // Complaint Filing
    complaintFiling: 'COMPLAINT FILING',
    selectIssues: 'SELECT\nISSUES',
    understandRights: 'UNDERSTAND\nRIGHTS',
    fillInformation: 'FILL\nINFORMATION',
    documents: 'DOCUMENTS',
    generateDrafts: 'GENERATE\nDRAFTS',
    
    // Issue Types
    theft: 'Theft',
    harassment: 'Harassment',
    cybercrime: 'Cybercrime',
    trafficViolation: 'Traffic Violation',
    pcc: 'Police Clearance Certificate (PCC)',
    
    // Rights
    yourRights: 'Your Rights',
    rightsFor: 'Rights for',
    complaint: 'Complaint:',
    
    // Personal Information
    fullName: 'Full Name *',
    phoneNumber: 'Phone Number *',
    emailAddress: 'Email Address',
    address: 'Address *',
    incidentDate: 'Incident Date *',
    incidentLocation: 'Incident Location *',
    descriptionOfIncident: 'Description of Incident *',
    enterFullName: 'Enter your full name',
    enterPhoneNumber: 'Enter your phone number',
    enterEmailAddress: 'Enter your email address',
    enterCompleteAddress: 'Enter your complete address',
    enterIncidentLocation: 'Enter the incident location',
    describeIncident: 'Describe the incident in detail',
    
    // Documents
    requiredDocuments: 'Required Documents',
    documentsNote: 'Please check the documents you have available. You can still proceed without all documents, but having them will help process your complaint faster.',
    
    // Preview
    previewGenerateDraft: 'Preview & Generate Draft',
    complaintType: 'Complaint Type:',
    personalInformation: 'Personal Information:',
    incidentDetails: 'Incident Details:',
    documentsAvailable: 'Documents Available:',
    outOf: 'out of',
    documentsChecked: 'documents checked',
    generateDraft: 'Generate Draft',
    
    // Success
    draftGeneratedSuccess: 'Draft Generated Successfully!',
    complaintDraftGenerated: 'Your complaint draft has been generated.',
    yourTokenNumber: 'Your Token Number:',
    saveTokenNote: 'Please save this token number for future reference. You can use it to track your complaint status.',
    continue: 'Continue',
    backToHome: 'Back to Home',
    
    // Common
    name: 'Name:',
    phone: 'Phone:',
    email: 'Email:',
    date: 'Date:',
    location: 'Location:',
    description: 'Description:',
    fileComplaint: 'File Complaint',
    
    // PCC
    pccFiling: 'PCC FILING',
    selectPccType: 'SELECT\nPCC TYPE',
    enterPurpose: 'ENTER\nPURPOSE',
    pccTypes: {
      employment: 'Employment',
      visa: 'Visa Application',
      immigration: 'Immigration',
      education: 'Education',
      business: 'Business License',
      others: 'Others'
    },
    purpose: 'Purpose *',
    enterPurposeDetails: 'Enter the purpose for PCC',
    pccPersonalInfo: 'PERSONAL\nINFORMATION',
    pccDocuments: 'DOCUMENTS',
    pccPreview: 'PREVIEW\n& GENERATE',
    pccType: 'PCC Type:',
    purposeDetails: 'Purpose:',
    pccDraftGenerated: 'Your PCC draft has been generated.',
    yourPccTokenNumber: 'Your PCC Token Number:',
    pccDraftGeneratedSuccess: 'PCC Draft Generated Successfully!'
  },
  
  hindi: {
    // Header
    goaPolice: 'गोवा पुलिस',
    aiVisitorAssistant: 'एआई विज़िटर असिस्टेंट',
    
    // Home Screen
    fileReport: 'रिपोर्ट दर्ज करें',
    fileReportSubtitle: 'File Report / रिपोर्ट दाखल करा',
    getInformation: 'जानकारी प्राप्त करें',
    getInformationSubtitle: 'Get Information / माहिती मेळवा',
    emergencyHelp: 'आपातकालीन सहायता',
    emergencyHelpSubtitle: 'Emergency Help / तातकाळ मदत',
    translationAssistant: 'अनुवाद सहायक',
    translationAssistantSubtitle: 'Translation Assistant / भाषांतर सहाय्यक',
    aiVoiceAssistant: 'एआई वॉयस असिस्टेंट',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening: 'सुन रहा हूं...',
    speaking: 'बोल रहा हूं...',
    processing: 'प्रोसेसिंग...',
    aiWelcomeMessage: 'नमस्ते! मैं आपका एआई सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?',
    
    // Emergency Modal
    emergencyTitle: 'आपातकालीन सहायता',
    enterName: 'नाम दर्ज करें',
    enterIssue: 'समस्या दर्ज करें',
    selectEmergencyIssue: 'आपातकालीन समस्या चुनें',
    medicalEmergency: 'चिकित्सा आपातकाल',
    fireEmergency: 'आग की आपातकाल',
    accidentEmergency: 'दुर्घटना आपातकाल',
    crimeInProgress: 'चल रहा अपराध',
    domesticViolence: 'घरेलू हिंसा',
    kidnapping: 'अपहरण',
    robbery: 'डकैती',
    others: 'अन्य',
    next: 'आगे',
    sosTicketGenerated: 'एसओएस टिकट जेनरेट हुआ!',
    yourSosTicketId: 'आपका एसओएस टिकट आईडी:',
    officerWillAssist: 'एक अधिकारी जल्द ही आपकी सहायता करेगा',
    ok: 'ठीक है',
    
    // Complaint Filing
    complaintFiling: 'शिकायत दर्ज करना',
    selectIssues: 'समस्याएं\nचुनें',
    understandRights: 'अधिकार\nसमझें',
    fillInformation: 'जानकारी\nभरें',
    documents: 'दस्तावेज',
    generateDrafts: 'ड्राफ्ट\nजेनरेट करें',
    
    // Issue Types
    theft: 'चोरी',
    harassment: 'उत्पीड़न',
    cybercrime: 'साइबर अपराध',
    trafficViolation: 'यातायात उल्लंघन',
    pcc: 'पुलिस चरित्र प्रमाणपत्र (पीसीसी)',
    
    // Rights
    yourRights: 'आपके अधिकार',
    rightsFor: 'अधिकार के लिए',
    complaint: 'शिकायत:',
    
    // Personal Information
    fullName: 'पूरा नाम *',
    phoneNumber: 'फोन नंबर *',
    emailAddress: 'ईमेल पता',
    address: 'पता *',
    incidentDate: 'घटना की तारीख *',
    incidentLocation: 'घटना का स्थान *',
    descriptionOfIncident: 'घटना का विवरण *',
    enterFullName: 'अपना पूरा नाम दर्ज करें',
    enterPhoneNumber: 'अपना फोन नंबर दर्ज करें',
    enterEmailAddress: 'अपना ईमेल पता दर्ज करें',
    enterCompleteAddress: 'अपना पूरा पता दर्ज करें',
    enterIncidentLocation: 'घटना का स्थान दर्ज करें',
    describeIncident: 'घटना का विस्तार से वर्णन करें',
    
    // Documents
    requiredDocuments: 'आवश्यक दस्तावेज',
    documentsNote: 'कृपया उपलब्ध दस्तावेजों को चेक करें। आप सभी दस्तावेजों के बिना भी आगे बढ़ सकते हैं, लेकिन इनसे आपकी शिकायत तेजी से प्रोसेस होगी।',
    
    // Preview
    previewGenerateDraft: 'पूर्वावलोकन और ड्राफ्ट जेनरेट करें',
    complaintType: 'शिकायत का प्रकार:',
    personalInformation: 'व्यक्तिगत जानकारी:',
    incidentDetails: 'घटना का विवरण:',
    documentsAvailable: 'उपलब्ध दस्तावेज:',
    outOf: 'में से',
    documentsChecked: 'दस्तावेज चेक किए गए',
    generateDraft: 'ड्राफ्ट जेनरेट करें',
    
    // Success
    draftGeneratedSuccess: 'ड्राफ्ट सफलतापूर्वक जेनरेट हुआ!',
    complaintDraftGenerated: 'आपका शिकायत ड्राफ्ट जेनरेट हो गया है।',
    yourTokenNumber: 'आपका टोकन नंबर:',
    saveTokenNote: 'कृपया इस टोकन नंबर को भविष्य के संदर्भ के लिए सेव करें। आप इसका उपयोग अपनी शिकायत की स्थिति ट्रैक करने के लिए कर सकते हैं।',
    continue: 'जारी रखें',
    backToHome: 'होम पर वापस',
    
    // Common
    name: 'नाम:',
    phone: 'फोन:',
    email: 'ईमेल:',
    date: 'तारीख:',
    location: 'स्थान:',
    description: 'विवरण:',
    fileComplaint: 'शिकायत दर्ज',
    
    // PCC
    pccFiling: 'पीसीसी दाखिल करना',
    selectPccType: 'पीसीसी प्रकार\nचुनें',
    enterPurpose: 'उद्देश्य\nदर्ज करें',
    pccTypes: {
      employment: 'रोजगार',
      visa: 'वीजा आवेदन',
      immigration: 'आप्रवासन',
      education: 'शिक्षा',
      business: 'व्यापार लाइसेंस',
      others: 'अन्य'
    },
    purpose: 'उद्देश्य *',
    enterPurposeDetails: 'पीसीसी का उद्देश्य दर्ज करें',
    pccPersonalInfo: 'व्यक्तिगत\nजानकारी',
    pccDocuments: 'दस्तावेज',
    pccPreview: 'पूर्वावलोकन\nऔर जेनरेट',
    pccType: 'पीसीसी प्रकार:',
    purposeDetails: 'उद्देश्य:',
    pccDraftGenerated: 'आपका पीसीसी ड्राफ्ट जेनरेट हो गया है।',
    yourPccTokenNumber: 'आपका पीसीसी टोकन नंबर:',
    pccDraftGeneratedSuccess: 'पीसीसी ड्राफ्ट सफलतापूर्वक जेनरेट हुआ!'
  },
  
  konkani: {
    // Header
    goaPolice: 'गोवा पोलिस',
    aiVisitorAssistant: 'एआई व्हिझिटर असिस्टंट',
    
    // Home Screen
    fileReport: 'रिपोर्ट दाखल करा',
    fileReportSubtitle: 'File Report / रिपोर्ट दर्ज करें',
    getInformation: 'माहिती मेळवा',
    getInformationSubtitle: 'Get Information / जानकारी प्राप्त करें',
    emergencyHelp: 'तातकाळ मदत',
    emergencyHelpSubtitle: 'Emergency Help / आपातकालीन सहायता',
    translationAssistant: 'भाषांतर सहाय्यक',
    translationAssistantSubtitle: 'Translation Assistant / अनुवाद सहायक',
    aiVoiceAssistant: 'एआई व्हॉइस असिस्टंट',
    tapToSpeak: 'बोलपाखातीर टॅप करा',
    listening: 'ऐकतां...',
    speaking: 'बोलतां...',
    processing: 'प्रोसेसिंग...',
    aiWelcomeMessage: 'नमस्कार! हांव तुमचो एआई सहाय्यक. आज हांव तुमची कशी मदत करूं शकतां?',
    
    // Emergency Modal
    emergencyTitle: 'तातकाळ मदत',
    enterName: 'नांव घाला',
    enterIssue: 'समस्या घाला',
    selectEmergencyIssue: 'तातकाळ समस्या निवडा',
    medicalEmergency: 'वैद्यकीय तातकाळ',
    fireEmergency: 'आग तातकाळ',
    accidentEmergency: 'अपघात तातकाळ',
    crimeInProgress: 'चालू गुन्हा',
    domesticViolence: 'घरगुती हिंसा',
    kidnapping: 'अपहरण',
    robbery: 'दरोडा',
    others: 'इतर',
    next: 'पुढे',
    sosTicketGenerated: 'एसओएस तिकीट तयार झाले!',
    yourSosTicketId: 'तुमचा एसओएस तिकीट आयडी:',
    officerWillAssist: 'एक अधिकारी लवकरच तुमची मदत करतील',
    ok: 'ठीक आसा',
    
    // Complaint Filing
    complaintFiling: 'शिकायत दाखल करप',
    selectIssues: 'समस्या\nनिवडा',
    understandRights: 'हक्क\nसमजा',
    fillInformation: 'माहिती\nभरा',
    documents: 'कागदपत्र',
    generateDrafts: 'ड्राफ्ट\nतयार करा',
    
    // Issue Types
    theft: 'चोरी',
    harassment: 'छळवणूक',
    cybercrime: 'सायबर गुन्हा',
    trafficViolation: 'वाहतूक उल्लंघन',
    pcc: 'पोलिस चारित्र्य प्रमाणपत्र (पीसीसी)',
    
    // Rights
    yourRights: 'तुमचे हक्क',
    rightsFor: 'हक्क खातीर',
    complaint: 'शिकायत:',
    
    // Personal Information
    fullName: 'पूरे नांव *',
    phoneNumber: 'फोन नंबर *',
    emailAddress: 'ईमेल पत्ता',
    address: 'पत्ता *',
    incidentDate: 'घटनेची तारीख *',
    incidentLocation: 'घटनेचे स्थान *',
    descriptionOfIncident: 'घटनेचे वर्णन *',
    enterFullName: 'तुमचे पूरे नांव घाला',
    enterPhoneNumber: 'तुमचो फोन नंबर घाला',
    enterEmailAddress: 'तुमचो ईमेल पत्ता घाला',
    enterCompleteAddress: 'तुमचो पूरो पत्ता घाला',
    enterIncidentLocation: 'घटनेचे स्थान घाला',
    describeIncident: 'घटनेचे तपशीलवार वर्णन करा',
    
    // Documents
    requiredDocuments: 'गरजेचे कागदपत्र',
    documentsNote: 'कृपया उपलब्ध कागदपत्र चेक करा। तुम्ही सगळे कागदपत्र नासतना पण पुढे वचूं शकता, पूण हे आसल्यार तुमची शिकायत बेगीन प्रोसेस जातली।',
    
    // Preview
    previewGenerateDraft: 'पूर्वावलोकन आनी ड्राफ्ट तयार करा',
    complaintType: 'शिकायतीचो प्रकार:',
    personalInformation: 'व्यक्तिगत माहिती:',
    incidentDetails: 'घटनेचे तपशील:',
    documentsAvailable: 'उपलब्ध कागदपत्र:',
    outOf: 'मधल्यान',
    documentsChecked: 'कागदपत्र चेक केले',
    generateDraft: 'ड्राफ्ट तयार करा',
    
    // Success
    draftGeneratedSuccess: 'ड्राफ्ट यशस्वीपणान तयार जाला!',
    complaintDraftGenerated: 'तुमचो शिकायत ड्राफ्ट तयार जाला.',
    yourTokenNumber: 'तुमचो टोकन नंबर:',
    saveTokenNote: 'कृपया हो टोकन नंबर भविष्यातल्या संदर्भाखातीर सेव्ह करा। तुम्ही हाचो वापर तुमच्या शिकायतीची स्थिती ट्रॅक करपाखातीर करूं शकता.',
    continue: 'चालू दवरा',
    backToHome: 'घरा परत',
    
    // Common
    name: 'नांव:',
    phone: 'फोन:',
    email: 'ईमेल:',
    date: 'तारीख:',
    location: 'स्थान:',
    description: 'वर्णन:',
    fileComplaint: 'शिकायत दाखल',
    
    // PCC
    pccFiling: 'पीसीसी दाखल करप',
    selectPccType: 'पीसीसी प्रकार\nनिवडा',
    enterPurpose: 'हेतू\nघाला',
    pccTypes: {
      employment: 'नोकरी',
      visa: 'व्हिसा अर्ज',
      immigration: 'स्थलांतर',
      education: 'शिक्षण',
      business: 'धंदो लायसन्स',
      others: 'इतर'
    },
    purpose: 'हेतू *',
    enterPurposeDetails: 'पीसीसीचो हेतू घाला',
    pccPersonalInfo: 'व्यक्तिगत\nमाहिती',
    pccDocuments: 'कागदपत्र',
    pccPreview: 'पूर्वावलोकन\nआनी तयार करा',
    pccType: 'पीसीसी प्रकार:',
    purposeDetails: 'हेतू:',
    pccDraftGenerated: 'तुमचो पीसीसी ड्राफ्ट तयार जाला.',
    yourPccTokenNumber: 'तुमचो पीसीसी टोकन नंबर:',
    pccDraftGeneratedSuccess: 'पीसीसी ड्राफ्ट यशस्वीपणान तयार जाला!'
  }
};