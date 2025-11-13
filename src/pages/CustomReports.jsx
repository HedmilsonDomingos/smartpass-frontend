import React, { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Sidebar from '../components/ui/Sidebar.jsx';

const CustomReports = () => {
  const token = localStorage.getItem('authToken');

  // === FILTER STATE ===
  const [filters, setFilters] = useState({
    status: 'All',
    categories: ['Engineers', 'Designers'],
    activityTypes: ['QR Code Scans', 'Logins'],
    dateFrom: '2023-10-01',
    dateTo: '2023-10-31',
    includeSummary: true,
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // === HANDLE FILTER CHANGE ===
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // === ADD/REMOVE CATEGORY TAG ===
  const toggleCategory = (cat) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  // === GENERATE REPORT ===
  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(
        'https://smartpass-api.onrender.com/api/reports/generate',
        filters,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReportData(res.data);
      setGenerating(false);
    } catch (err) {
      alert('Failed to generate report.');
      setGenerating(false);
    }
  };

  // === EXPORT TO PDF ===
  const exportPDF = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'https://smartpass-api.onrender.com/api/reports/export/pdf',
        { ...filters, data: reportData },
        { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartPass_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      link.click();
    } catch (err) {
      alert('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  // === EXPORT TO CSV ===
  const exportCSV = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'https://smartpass-api.onrender.com/api/reports/export/csv',
        { ...filters, data: reportData },
        { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartPass_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.click();
    } catch (err) {
      alert('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  // === RESET FILTERS ===
  const resetFilters = () => {
    setFilters({
      status: 'All',
      categories: [],
      activityTypes: [],
      dateFrom: '',
      dateTo: '',
      includeSummary: true,
    });
    setReportData(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-[#333333] dark:text-white">Generate & Customize Reports</h1>
            <p className="mt-2 text-[#616f89] dark:text-gray-400">Use the filters to create a detailed report on employee activity and status.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: Filters */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-[#DEE2E6] dark:border-gray-700 bg-white dark:bg-background-dark p-6">
                <h2 className="text-[22px] font-bold pb-4">Report Options</h2>

                <div className="space-y-6">

                  {/* Status */}
                  <div>
                    <label className="block text-base font-medium pb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full h-12 rounded-lg border border-[#DEE2E6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4"
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-base font-medium pb-2">Employee Category</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full h-12 rounded-lg border border-[#DEE2E6] dark:border-gray-600 bg-white dark:bg-gray-800 pl-4 pr-10"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['Engineers', 'Designers', 'Marketing', 'Sales'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`flex items-center gap-1.5 h-8 rounded-full px-3 text-sm font-medium transition ${
                            filters.categories.includes(cat)
                              ? 'bg-primary/20 text-primary dark:bg-primary/30'
                              : 'bg-gray-200 text-gray-600 dark:bg-gray-700'
                          }`}
                        >
                          {cat}
                          {filters.categories.includes(cat) && (
                            <span className="material-symbols-outlined text-base">close</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Types */}
                  <div>
                    <label className="block text-base font-medium pb-2">Activity Type</label>
                    <div className="space-y-2">
                      {['QR Code Scans', 'Profile Updates', 'Logins'].map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.activityTypes.includes(type)}
                            onChange={() => {
                              setFilters(prev => ({
                                ...prev,
                                activityTypes: prev.activityTypes.includes(type)
                                  ? prev.activityTypes.filter(t => t !== type)
                                  : [...prev.activityTypes, type]
                              }));
                            }}
                            className="form-checkbox rounded text-primary"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-base font-medium pb-2">Date Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="h-12 rounded-lg border border-[#DEE2E6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4"
                      />
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className="h-12 rounded-lg border border-[#DEE2E6] dark:border-gray-600 bg-white dark:bg-gray-800 px-4"
                      />
                    </div>
                  </div>

                  {/* Include Summary */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">Include summary page</span>
                    <button
                      onClick={() => handleFilterChange('includeSummary', !filters.includeSummary)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition ${filters.includeSummary ? 'bg-primary' : 'bg-gray-400'}`}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${filters.includeSummary ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 pt-6 border-t border-[#DEE2E6] dark:border-gray-700 space-y-3">
                  <button
                    onClick={generateReport}
                    disabled={generating}
                    className="w-full h-12 bg-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-70"
                  >
                    <span className="material-symbols-outlined">query_stats</span>
                    {generating ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button
                    onClick={resetFilters}
                    className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Report Preview */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#DEE2E6] dark:border-gray-700 bg-white dark:bg-background-dark p-6 min-h-[600px] flex flex-col">
                {!reportData ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
                      <span className="material-symbols-outlined text-4xl text-primary">insights</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold">Generate a report to get started</h3>
                    <p className="mt-1 text-[#616f89] dark:text-gray-400">Configure your report options on the left and click 'Generate Report' to see a preview here.</p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold">Report Preview</h3>
                      <div className="flex gap-3">
                        <button onClick={exportPDF} className="px-4 h-10 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Export PDF</button>
                        <button onClick={exportCSV} className="px-4 h-10 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Export CSV</button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <p className="text-lg font-semibold">Total Employees: {reportData.summary?.total || 0}</p>
                      <p>Active: {reportData.summary?.active || 0} | Inactive: {reportData.summary?.inactive || 0}</p>
                      <p className="mt-4">Report generated on {format(new Date(), 'PPP')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomReports;