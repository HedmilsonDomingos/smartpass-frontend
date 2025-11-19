import React, { useState } from 'react';
import { format } from 'date-fns';
import api from '../lib/api';

const CustomReports = () => {
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
      const res = await api.post(
        '/api/reports/custom',
        filters
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
      const res = await api.post(
        '/api/reports/export/pdf',
        { ...filters, data: reportData },
        { responseType: 'blob' }
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
      const res = await api.post(
        '/api/reports/export/csv',
        { ...filters, data: reportData },
        { responseType: 'blob' }
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
    <div className="flex min-h-screen bg-gray-100 dark:bg-black">
      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">Generate & Customize Reports</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Use the filters to create a detailed report on employee activity and status.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: Filters */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h2 className="text-[22px] font-bold pb-4 text-gray-900 dark:text-white">Report Options</h2>

                <div className="space-y-6 text-gray-900 dark:text-white">

                  {/* Status */}
                  <div>
                    <label className="block text-base font-medium pb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4"
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-base font-medium pb-2">Employee</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-4 pr-10"
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
                              ? 'bg-blue-600/20 text-blue-600 dark:bg-blue-600/30'
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
                            className="form-checkbox rounded text-blue-600"
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
                        className="h-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4"
                      />
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className="h-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4"
                      />
                    </div>
                  </div>

                  {/* Include Summary */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">Include summary page</span>
                    <button
                      onClick={() => handleFilterChange('includeSummary', !filters.includeSummary)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition ${filters.includeSummary ? 'bg-blue-600' : 'bg-gray-400'}`}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${filters.includeSummary ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <button
                    onClick={generateReport}
                    disabled={generating}
                    className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-70"
                  >
                    <span className="material-symbols-outlined">query_stats</span>
                    {generating ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button
                    onClick={resetFilters}
                    className="w-full h-12 bg-gray-200 dark:bg-gray-800 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Report Preview */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 min-h-[600px] flex flex-col">
                {!reportData ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-blue-600/10 dark:bg-blue-600/20 p-4">
                      <span className="material-symbols-outlined text-4xl text-blue-600">insights</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Generate a report to get started</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Configure your report options on the left and click 'Generate Report' to see a preview here.</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Report Preview</h3>
                      <div className="flex gap-3">
                        <button onClick={exportPDF} className="px-4 h-10 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50" disabled={loading}>Export PDF</button>
                        <button onClick={exportCSV} className="px-4 h-10 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50" disabled={loading}>Export CSV</button>
                      </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-gray-800 dark:text-gray-200">
                      <p className="text-lg font-semibold">Total Employees: {reportData.summary?.total || 0}</p>
                      <p>Active: {reportData.summary?.active || 0} | Inactive: {reportData.summary?.inactive || 0}</p>
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Report generated on {format(new Date(), 'PPP')}</p>
                    </div>

                    {/* Detailed Results Table */}
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                          {reportData.results?.length > 0 ? (
                            reportData.results.map((employee, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{employee.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {employee.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(employee.createdAt), 'PP')}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No employees match the selected filters.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
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
