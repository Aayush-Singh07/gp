import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, FileText, AlertTriangle, Shield, Search, Filter, Edit, Check, X, Users } from 'lucide-react';
import { Language, translations } from '../types/language';
import { complaintsService, Complaint } from '../lib/supabase';

interface PoliceDashboardProps {
  language: Language;
  onBack: () => void;
}

const PoliceDashboard: React.FC<PoliceDashboardProps> = ({ language, onBack }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'complaint' | 'sos' | 'pcc'>('all');
  const t = translations[language];

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintsService.getAll();
      setComplaints(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (id: string, status: 'pending' | 'in_progress' | 'resolved') => {
    try {
      await complaintsService.updateStatus(id, status);
      await loadComplaints(); // Reload data
      setEditingComplaint(null);
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const updateComplaintData = async (id: string, updatedData: any) => {
    try {
      // This would need a new method in complaintsService to update complaint data
      // For now, we'll just update the status
      await complaintsService.updateStatus(id, 'in_progress');
      await loadComplaints();
      setEditingComplaint(null);
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const getComplaintTypeColor = (type: string) => {
    switch (type) {
      case 'complaint':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'sos':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'pcc':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'women_complaint':
        return 'bg-pink-100 border-pink-500 text-pink-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getComplaintTypeIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <FileText className="w-5 h-5" />;
      case 'sos':
        return <AlertTriangle className="w-5 h-5" />;
      case 'pcc':
        return <Shield className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
      case 'women_complaint':
        return <Users className="w-5 h-5" />;
    }
  };

  const getComplaintTypeName = (type: string) => {
    switch (type) {
      case 'complaint':
        return language === 'english' ? 'File Complaint' : 
               language === 'hindi' ? 'शिकायत दर्ज' : 'शिकायत दाखल';
      case 'sos':
        return language === 'english' ? 'SOS Emergency' : 
               language === 'hindi' ? 'एसओएस आपातकाल' : 'एसओएस तातकाळ';
      case 'pcc':
        return language === 'english' ? 'PCC Application' : 
               language === 'hindi' ? 'पीसीसी आवेदन' : 'पीसीसी अर्ज';
      case 'women_complaint':
        return language === 'english' ? 'Women Officer Section' : 
               language === 'hindi' ? 'महिला अधिकारी अनुभाग' : 'महिला अधिकारी विभाग';
      default:
        return type;
    }
  };

  const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress');
  const completedComplaints = complaints.filter(c => c.status === 'resolved');

  const getFilteredComplaints = (complaintsToFilter: Complaint[]) => {
    return complaintsToFilter.filter(complaint => {
      const matchesFilter = filterType === 'all' || complaint.type === filterType;
      const matchesSearch = complaint.complainant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.token_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const viewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const editComplaint = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setSelectedComplaint(null);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
    setEditingComplaint(null);
  };

  const renderComplaintCard = (complaint: Complaint, showEditButton: boolean = false) => (
    <div
      key={complaint.id}
      className={`bg-white rounded-lg p-4 border-l-4 ${getComplaintTypeColor(complaint.type)} shadow hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => viewComplaint(complaint)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${getComplaintTypeColor(complaint.type)}`}>
            {getComplaintTypeIcon(complaint.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{complaint.complainant_name}</h3>
            <p className="text-sm text-gray-600">{getComplaintTypeName(complaint.type)}</p>
            <p className="text-xs text-gray-500">
              {language === 'english' ? 'Token:' : language === 'hindi' ? 'टोकन:' : 'टोकन:'} {complaint.token_number}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {new Date(complaint.created_at).toLocaleDateString()}
            </p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
              complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {complaint.status === 'pending' ? 
                (language === 'english' ? 'Pending' : language === 'hindi' ? 'लंबित' : 'प्रलंबित') :
               complaint.status === 'in_progress' ? 
                (language === 'english' ? 'In Progress' : language === 'hindi' ? 'प्रगति में' : 'प्रगतींत') :
                (language === 'english' ? 'Resolved' : language === 'hindi' ? 'हल हो गया' : 'सोडवलां')
              }
            </span>
          </div>
          {showEditButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                editComplaint(complaint);
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>
                {language === 'english' ? 'Edit' : language === 'hindi' ? 'संपादित' : 'संपादन'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditForm = () => {
    if (!editingComplaint) return null;

    const complaintData = editingComplaint.complaint_data;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {language === 'english' ? 'Edit Complaint' : 
               language === 'hindi' ? 'शिकायत संपादित करें' : 'शिकायत संपादन'}
            </h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? 'Token Number' : 
                   language === 'hindi' ? 'टोकन नंबर' : 'टोकन नंबर'}
                </label>
                <input
                  type="text"
                  value={editingComplaint.token_number}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? 'Type' : language === 'hindi' ? 'प्रकार' : 'प्रकार'}
                </label>
                <input
                  type="text"
                  value={getComplaintTypeName(editingComplaint.type)}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'english' ? 'Complainant Name' : 
                 language === 'hindi' ? 'शिकायतकर्ता का नाम' : 'शिकायतकर्त्याचे नांव'}
              </label>
              <input
                type="text"
                value={editingComplaint.complainant_name}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setEditingComplaint({
                  ...editingComplaint,
                  complainant_name: e.target.value
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? 'Phone Number' : 
                   language === 'hindi' ? 'फोन नंबर' : 'फोन नंबर'}
                </label>
                <input
                  type="text"
                  value={editingComplaint.complainant_phone}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setEditingComplaint({
                    ...editingComplaint,
                    complainant_phone: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? 'Email' : language === 'hindi' ? 'ईमेल' : 'ईमेल'}
                </label>
                <input
                  type="email"
                  value={editingComplaint.complainant_email || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setEditingComplaint({
                    ...editingComplaint,
                    complainant_email: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Complaint-specific data */}
            {complaintData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? 'Complaint Details' : 
                   language === 'hindi' ? 'शिकायत विवरण' : 'शिकायतीचे तपशील'}
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(complaintData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => updateComplaintData(editingComplaint.id, editingComplaint)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>
                    {language === 'english' ? 'Update Draft' : 
                     language === 'hindi' ? 'ड्राफ्ट अपडेट करें' : 'ड्राफ्ट अपडेट करा'}
                  </span>
                </button>
                
                <button
                  onClick={() => updateComplaintStatus(editingComplaint.id, 'resolved')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {language === 'english' ? 'Mark Completed' : 
                     language === 'hindi' ? 'पूर्ण चिह्नित करें' : 'पूर्ण म्हणून चिन्हांकित करा'}
                  </span>
                </button>
              </div>
              
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {language === 'english' ? 'Cancel' : language === 'hindi' ? 'रद्द करें' : 'रद्द करा'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            <div>
              <h1 className="text-xl font-bold">
                {language === 'english' ? 'Police Dashboard' : 
                 language === 'hindi' ? 'पुलिस डैशबोर्ड' : 'पोलिस डॅशबोर्ड'}
              </h1>
              <p className="text-blue-200 text-sm">
                {language === 'english' ? 'Complaint Management System' : 
                 language === 'hindi' ? 'शिकायत प्रबंधन प्रणाली' : 'शिकायत व्यवस्थापन प्रणाली'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-pink-100 p-2 rounded-full mr-3">
              <Users className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {complaints.filter(c => c.complaint_data?.category === 'women_safety').length}
              </p>
              <p className="text-sm text-gray-600">
                {language === 'english' ? 'Women' : language === 'hindi' ? 'महिला' : 'महिला'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={language === 'english' ? 'Search by name or token number...' : 
                              language === 'hindi' ? 'नाम या टोकन नंबर से खोजें...' : 'नांव वा टोकन नंबरान सोदा...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'complaint' | 'sos' | 'pcc' | 'women_complaint')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">
                  {language === 'english' ? 'All Types' : 
                   language === 'hindi' ? 'सभी प्रकार' : 'सगळे प्रकार'}
                </option>
                <option value="complaint">
                  {language === 'english' ? 'File Complaint' : 
                   language === 'hindi' ? 'शिकायत दर्ज' : 'शिकायत दाखल'}
                </option>
                <option value="sos">
                  {language === 'english' ? 'SOS Emergency' : 
                   language === 'hindi' ? 'एसओएस आपातकाल' : 'एसओएस तातकाळ'}
                </option>
                <option value="pcc">
                  {language === 'english' ? 'PCC Application' : 
                   language === 'hindi' ? 'पीसीसी आवेदन' : 'पीसीसी अर्ज'}
                </option>
                <option value="women_complaint">
                  {language === 'english' ? 'Women Officer Section' : 
                   language === 'hindi' ? 'महिला अधिकारी अनुभाग' : 'महिला अधिकारी विभाग'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{complaints.length}</p>
                <p className="text-sm text-gray-600">
                  {language === 'english' ? 'Total' : language === 'hindi' ? 'कुल' : 'एकूण'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{pendingComplaints.length}</p>
                <p className="text-sm text-gray-600">
                  {language === 'english' ? 'Pending' : language === 'hindi' ? 'लंबित' : 'प्रलंबित'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedComplaints.length}</p>
                <p className="text-sm text-gray-600">
                  {language === 'english' ? 'Completed' : language === 'hindi' ? 'पूर्ण' : 'पूर्ण'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {complaints.filter(c => c.type === 'sos').length}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'english' ? 'SOS' : 'एसओएस'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg mb-4">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'english' ? 'Pending' : language === 'hindi' ? 'लंबित' : 'प्रलंबित'} 
              ({pendingComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'completed'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'english' ? 'Completed' : language === 'hindi' ? 'पूर्ण' : 'पूर्ण'} 
              ({completedComplaints.length})
            </button>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {activeTab === 'pending' ? (
            getFilteredComplaints(pendingComplaints).length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {language === 'english' ? 'No pending complaints found' : 
                   language === 'hindi' ? 'कोई लंबित शिकायत नहीं मिली' : 'खंयच्यो प्रलंबित शिकायती मेळ्यो ना'}
                </p>
              </div>
            ) : (
              getFilteredComplaints(pendingComplaints).map((complaint) => 
                renderComplaintCard(complaint, true)
              )
            )
          ) : (
            getFilteredComplaints(completedComplaints).length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <Check className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {language === 'english' ? 'No completed complaints found' : 
                   language === 'hindi' ? 'कोई पूर्ण शिकायत नहीं मिली' : 'खंयच्यो पूर्ण शिकायती मेळ्यो ना'}
                </p>
              </div>
            ) : (
              getFilteredComplaints(completedComplaints).map((complaint) => 
                renderComplaintCard(complaint, false)
              )
            )
          )}
        </div>
      </div>

      {/* View Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {language === 'english' ? 'Complaint Details' : 
                 language === 'hindi' ? 'शिकायत विवरण' : 'शिकायतीचे तपशील'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'english' ? 'Token Number' : 
                     language === 'hindi' ? 'टोकन नंबर' : 'टोकन नंबर'}
                  </label>
                  <p className="text-gray-900 font-mono">{selectedComplaint.token_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'english' ? 'Type' : language === 'hindi' ? 'प्रकार' : 'प्रकार'}
                  </label>
                  <p className="text-gray-900">{getComplaintTypeName(selectedComplaint.type)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'english' ? 'Complainant Name' : 
                   language === 'hindi' ? 'शिकायतकर्ता का नाम' : 'शिकायतकर्त्याचे नांव'}
                </label>
                <p className="text-gray-900">{selectedComplaint.complainant_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'english' ? 'Phone Number' : 
                   language === 'hindi' ? 'फोन नंबर' : 'फोन नंबर'}
                </label>
                <p className="text-gray-900">{selectedComplaint.complainant_phone}</p>
              </div>
              
              {selectedComplaint.complainant_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'english' ? 'Email' : language === 'hindi' ? 'ईमेल' : 'ईमेल'}
                  </label>
                  <p className="text-gray-900">{selectedComplaint.complainant_email}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'english' ? 'Complaint Data' : 
                   language === 'hindi' ? 'शिकायत डेटा' : 'शिकायत डेटा'}
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedComplaint.complaint_data, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {language === 'english' ? 'Close' : language === 'hindi' ? 'बंद करें' : 'बंद करा'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {renderEditForm()}
    </div>
  );
};

export default PoliceDashboard;