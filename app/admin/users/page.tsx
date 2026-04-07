'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, RefreshCcw, Users, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { ApiResponse, IUser } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<IUser[]>>('/api/admin/users');
      if (!data.success) throw new Error(data.error || 'Failed to fetch users');
      return data.data || [];
    },
  });

  const filteredUsers = users?.filter((user) => {
    const name = user.name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  }) || [];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader 
          title="User Directory" 
          description="View and monitor all registered accounts across the platform." 
        />
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-200 focus:bg-white" 
            />
          </div>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl h-12 px-4 border-slate-200">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-8 min-w-[250px]">User Details</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest min-w-[120px]">Role</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest min-w-[180px]">Phone Number</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest min-w-[150px]">Joined Date</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-8 py-5"><Skeleton className="h-12 w-48 rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-slate-50/80 transition-colors border-slate-100 cursor-default">
                  
                  {/* USER DETAILS */}
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* ROLE */}
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Admin</Badge>
                    ) : user.role === 'doctor' ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Doctor</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Patient</Badge>
                    )}
                  </TableCell>

                  {/* PHONE NUMBER */}
                  <TableCell>
                    <span className="text-sm font-medium text-slate-600">
                      {user.phone || <span className="text-slate-400 italic">Not provided</span>}
                    </span>
                  </TableCell>

                  {/* JOINED DATE */}
                  <TableCell>
                    <span className="text-sm font-medium text-slate-900">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : 'Unknown'}
                    </span>
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                       <ShieldCheck className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No users found</h3>
                    <p className="text-slate-500 max-w-sm">
                      {searchTerm ? `No results found for "${searchTerm}".` : "Your database currently has no registered users."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
  );
}
