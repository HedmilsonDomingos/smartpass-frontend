import React, { useState, useEffect } from 'react';
import { publicApi } from '../lib/api';
import { useParams } from 'react-router-dom';

const PublicEmployeePage = () => {
  const { slug } = useParams(); // e.g. /p/john-doe or /p/12345
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // === FETCH PUBLIC EMPLOYEE PROFILE FROM BACKEND ===
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // Fetch public employee profile using the public endpoint
        const res = await publicApi.get(`/api/employees/public/${slug}`);
        setEmployee(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Public Employee not found:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [slug]);

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // === ERROR / NOT FOUND ===
  if (error || !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center p-8 max-w-md">
          <span className="material-symbols-outlined text-8xl text-red-500 mb-4 block">error</span>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Employee Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This profile is either private, expired, or does not exist.
          </p>
        </div>
      </div>
    );
  }

  // === DETERMINE STATUS ===
  const isActive = employee.status === 'Active';
  const statusColor = isActive
    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
  const statusIcon = isActive ? 'check_circle' : 'cancel';

  // === NORMALIZE COMMON FIELDS FOR DISPLAY ===
  const displayName = (employee && (employee.fullName || employee.name || employee.username)) || 'Unknown';
  const displayJobTitle = (employee && (employee.cargo || employee.title || employee.position)) || 'Employee';
  const displayCompany = (employee && (employee.company || employee.organisation || employee.organization)) || 'SmartPass Company';
  const displayProfileImage = (employee && (
    employee.profilePic || employee.photo || employee.avatar || employee.picture || employee.image
  )) || 'https://via.placeholder.com/128';

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md">

            {/* SmartPass Header */}
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary rounded-lg size-10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray text-2xl">qr_code_scanner</span>
                </div>
                <h1 className="font-bold text-2xl text-gray-700 dark:text-gray">SmartPass</h1>
              </div>
              <h2 className="text-gray-700 dark:text-gray text-xl font-bold tracking-tight">
                {displayCompany}
              </h2>
            </div>

            {/* Profile Card */}
            <div className="flex flex-col gap-8 rounded-xl bg-white dark:bg-gray-900/50 shadow-sm p-6 sm:p-8 border border-gray-200 dark:border-gray-800">

              {/* Profile Photo + Name + Job */}
              <div className="flex w-full flex-col items-center gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-white dark:border-gray-800 shadow-md"
                    style={{ backgroundImage: `url(${displayProfileImage})` }}
                  ></div>

                  <div className="flex flex-col items-center text-center">
                    <p className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
                      {displayName}
                    </p>
                    <p className="text-primary text-base font-medium">
                      {displayJobTitle}
                    </p>
                  </div>

                {/* Status Badge */}
                <div className={`flex h-9 items-center justify-center gap-x-2 rounded-full px-4 ${statusColor}`}>
                  <span className="material-symbols-outlined text-lg">
                    {statusIcon}
                  </span>
                  <p className="text-sm font-medium">
                    {isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    {employee.company || 'Innovatech Solutions'}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    {employee.department || '—'}
                  </p>
                </div>


                <div className="flex flex-col gap-1 sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Card Expiration</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    {employee.idCardExpiration
                      ? new Date(employee.idCardExpiration).toLocaleDateString()
                      : 'December 31, 2025'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="flex flex-col gap-6 px-5 py-10 text-center mt-10">
              <div className="flex flex-wrap items-center justify-center">
                <a href="https://smartpass.com" className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary">
                  smartpass.com
                </a>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                © 2025 SmartPass Inc. All rights reserved, Hem Quick Tech Solution, Lda.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicEmployeePage;
