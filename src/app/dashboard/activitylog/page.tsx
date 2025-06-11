'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ActivityLog } from '@/types';
import { activityLogApi } from '@/api/activitylog.api';
import { useAuth } from '@/context/auth/auth.context';
import { Role } from '@/types';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RefreshCw,
    ArrowUpDown,
    Clock,
    User,
    Activity,
    Trash2,
    Eye
} from 'lucide-react';
import useToastHandler from '@/hooks/useToastHandler';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

type SortConfig = {
    key: 'id' | 'createdAt' | 'action' | 'userId';
    direction: 'ascending' | 'descending';
};

export default function ActivityLogsPage() {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string>('all');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'createdAt',
        direction: 'descending'
    });
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const itemsPerPage = 10;
    const router = useRouter();
    const { user } = useAuth();
    const { showError, showSuccess } = useToastHandler();

    const fetchActivityLogs = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            setError(null);

            const params: any = {};
            if (user?.role === Role.SUPER_ADMIN && selectedUserId !== 'all') {
                params.userId = parseInt(selectedUserId);
            }

            const response = await activityLogApi.getActivityLogs(params);
            setActivityLogs(response.data);
            setFilteredLogs(response.data);
        } catch (error) {
            const errorMsg = 'Gagal memuat log aktivitas. Silakan coba lagi.';
            setError(errorMsg);
            showError(error, errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedUserId, showError]);

    useEffect(() => {
        if (user) {
            fetchActivityLogs();
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === Role.SUPER_ADMIN && selectedUserId !== 'all') {
            const filtered = activityLogs.filter(log =>
                log.user?.id.toString() === selectedUserId
            );
            setFilteredLogs(filtered);
            setCurrentPage(1);
        } else {
            setFilteredLogs(activityLogs);
        }
    }, [selectedUserId, activityLogs, user?.role]);

    useEffect(() => {
        let result = [...activityLogs];

        if (searchQuery) {
            result = result.filter(log =>
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (log.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (log.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                log.id.toString().includes(searchQuery)
            );
        }

        if (selectedAction !== 'all') {
            result = result.filter(log => log.action === selectedAction);
        }

        result.sort((a, b) => {
            let aValue: any = a[sortConfig.key];
            let bValue: any = b[sortConfig.key];

            if (sortConfig.key === 'userId') {
                aValue = a.user?.name || '';
                bValue = b.user?.name || '';
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setFilteredLogs(result);
        setCurrentPage(1);
    }, [activityLogs, searchQuery, selectedAction, sortConfig]);

    const requestSort = (key: 'id' | 'createdAt' | 'action' | 'userId') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleViewDetails = (log: ActivityLog) => {
        setSelectedLog(log);
        setIsDialogOpen(true);
    };

    const handleRefresh = () => {
        fetchActivityLogs();
    };

    const handleRealtimeRefresh = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const params: any = { realtime: true };

            const response = await activityLogApi.getActivityLogs(params);
            setActivityLogs(response.data);

            let filteredData = [...response.data];

            if (user?.role === Role.SUPER_ADMIN && selectedUserId !== 'all') {
                filteredData = filteredData.filter(log =>
                    log.user?.id.toString() === selectedUserId
                );
            }

            setFilteredLogs(filteredData);
            showSuccess('Data berhasil diperbarui secara realtime');
        } catch (error) {
            showError(error, 'Gagal memperbarui data');
        } finally {
            setIsLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        const actionColors: { [key: string]: string } = {
            'LOGIN': 'bg-green-100 text-green-800',
            'LOGOUT': 'bg-gray-100 text-gray-800',
            'CREATE': 'bg-blue-100 text-blue-800',
            'UPDATE': 'bg-yellow-100 text-yellow-800',
            'DELETE': 'bg-red-100 text-red-800',
            'DELETE_ACTIVITY_LOG': 'bg-red-100 text-red-800',
            'VIEW': 'bg-purple-100 text-purple-800',
            'PAYMENT_SUCCESS': 'bg-emerald-100 text-emerald-800',
        };
        return actionColors[action] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: localeId });
    };

    const getUniqueActions = useCallback(() => {
        const actions = [...new Set(activityLogs.map(log => log.action))];
        return actions.sort();
    }, [activityLogs]);

    const getUniqueUsers = useCallback(() => {
        const users = activityLogs
            .filter(log => log.user)
            .map(log => ({ id: log.user!.id, name: log.user!.name }))
            .filter((user, index, self) =>
                index === self.findIndex(u => u.id === user.id)
            );
        return users.sort((a, b) => a.name.localeCompare(b.name));
    }, [activityLogs]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots: (number | string)[] = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
        router.push('/dashboard');
        return null;
    }

    if (!user) {
        return (
            <div className="container mx-auto">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <RefreshCw className="animate-spin h-8 w-8 text-primary mb-4" />
                    <p className="text-muted-foreground">Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Log Aktivitas
                    </h1>
                    <p className="text-muted-foreground">
                        Pantau semua aktivitas pengguna dalam sistem
                    </p>
                </div>
                <div className="flex gap-2 items-center justify-between">
                    <Button variant="default" onClick={handleRealtimeRefresh} disabled={isLoading}>
                        <Clock className="mr-2 h-4 w-4" />
                        Realtime Update
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <CardTitle className="text-lg">Riwayat Aktivitas</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <Input
                                placeholder="Cari aktivitas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64"
                            />

                            {user?.role === Role.SUPER_ADMIN && (
                                <Select
                                    value={selectedUserId}
                                    onValueChange={(value) => {
                                        setSelectedUserId(value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter Pengguna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Pengguna</SelectItem>
                                        {getUniqueUsers().map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <Select value={selectedAction} onValueChange={setSelectedAction}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter Aksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Aksi</SelectItem>
                                    {getUniqueActions().map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {action}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <RefreshCw className="animate-spin h-8 w-8 text-primary mb-4" />
                            <p className="text-muted-foreground">Memuat log aktivitas...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 flex flex-col items-center gap-4">
                            <div className="text-red-500">{error}</div>
                            <Button variant="outline" onClick={handleRefresh}>
                                Coba Lagi
                            </Button>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center gap-4">
                            <Activity className="h-12 w-12 text-muted-foreground" />
                            <div className="text-muted-foreground">
                                {searchQuery || selectedAction !== 'all'
                                    ? 'Tidak ada log aktivitas yang sesuai dengan filter'
                                    : 'Belum ada log aktivitas'
                                }
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="relative overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[80px]">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => requestSort('id')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    ID
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => requestSort('userId')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    Pengguna
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => requestSort('action')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    Aksi
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentItems.map((log) => (
                                            <TableRow key={log.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{log.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {log.user?.name || 'Unknown User'}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {log.user?.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getActionColor(log.action)}>
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(log)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Lihat Detail
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Detail Dialog */}
                            {/* Detail Dialog */}
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent className="sm:max-w-[625px]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Detail Aktivitas
                                        </DialogTitle>
                                    </DialogHeader>
                                    {selectedLog && (
                                        <div className="grid gap-4 py-4">
                                            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 rounded-full bg-primary/10">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{selectedLog.user?.name || 'Unknown User'}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedLog.user?.email || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Waktu</p>
                                                    <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-muted/50 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Aksi</h4>
                                                    <Badge className={`${getActionColor(selectedLog.action)} px-3 py-1`}>
                                                        {selectedLog.action}
                                                    </Badge>
                                                </div>
                                                <div className="bg-muted/50 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">IP Address</h4>
                                                    <p className="font-medium">{selectedLog.ipAddress || '-'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Detail Aktivitas</h4>
                                                <div className="bg-muted/50 p-4 rounded-lg">
                                                    {selectedLog.details ? (
                                                        <pre className="whitespace-pre-wrap text-sm font-mono">
                                                            {selectedLog.details}
                                                        </pre>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            Tidak ada detail tambahan
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>

                            {totalPages > 1 && (
                                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t gap-4">
                                    <div className="text-sm text-muted-foreground hidden md:block">
                                        Menampilkan{' '}
                                        <span className="font-medium">
                                            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLogs.length)}
                                        </span>{' '}
                                        dari <span className="font-medium">{filteredLogs.length}</span> log aktivitas
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {getPageNumbers().map((pageNum, index) => (
                                            <Button
                                                key={index}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                                                disabled={pageNum === '...'}
                                                className="h-8 min-w-8"
                                            >
                                                {pageNum}
                                            </Button>
                                        ))}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}