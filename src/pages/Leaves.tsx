
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useLeaves } from '@/context/LeaveContext';
import LeaveManagement from '@/components/LeaveManagement';

const Leaves: React.FC = () => {
  const { user, isManager, isAdmin } = useAuth();
  const { leaves, updateLeaveStatus, loading } = useLeaves();

  // If not a manager or admin, redirect or show access denied
  if (!isManager && !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Leave Management</h1>
        
        <LeaveManagement 
          leaves={leaves}
          onLeaveUpdate={updateLeaveStatus}
          isManagerView={true}
        />
      </div>
    </DashboardLayout>
  );
};

export default Leaves;
