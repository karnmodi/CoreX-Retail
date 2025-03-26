import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar, User, Clock } from 'lucide-react';

const RosterApprovalRequest = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      managerName: 'Karan Modi',
      requestDate: '2025-03-04T09:30:00',
      startDate: '2025-03-10',
      endDate: '2025-03-16',
      status: 'pending',
      staffCount: 12,
      totalHours: 384,
      notes: 'Adjusted for spring sale promotion'
    },
    {
      id: 2,
      managerName: 'K Modi',
      requestDate: '2025-03-05T10:15:00',
      startDate: '2025-03-10',
      endDate: '2025-03-16',
      status: 'pending',
      staffCount: 8,
      totalHours: 256,
      notes: 'One staff member on leave'
    }
  ]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleApprove = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'approved' } : request
    ));
  };

  const handleReject = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'rejected' } : request
    ));
  };

  const getBadgeColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Roster Approval Requests</h1>
      
      {requests.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p>No pending roster approval requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-2">
                <div className="flex justify-between items-start">
                  {/* <div>
                    <CardTitle className="text-lg">{request.storeName}</CardTitle>
                    <p className="text-sm text-gray-500">Store ID: {request.storeId}</p>
                  </div> */}
                  <Badge className={getBadgeColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Manager: {request.managerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Period: {formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Requested: {formatDate(request.requestDate)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm"><strong>Staff Count:</strong> {request.staffCount}</div>
                    <div className="text-sm"><strong>Total Hours:</strong> {request.totalHours}</div>
                    {request.notes && (
                      <div className="text-sm"><strong>Notes:</strong> {request.notes}</div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              {request.status === 'pending' && (
                <CardFooter className="bg-gray-50 flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleReject(request.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(request.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RosterApprovalRequest;