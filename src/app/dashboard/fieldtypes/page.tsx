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
import { FieldType } from '@/types';
import { fieldApi } from '@/api/field.api';
import { useAuth } from '@/context/auth/auth.context';
import { Role } from '@/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PlusCircle, RefreshCw, ArrowUpDown } from 'lucide-react';
import useToastHandler from '@/hooks/useToastHandler';

type SortConfig = {
    key: 'id' | 'name';
    direction: 'ascending' | 'descending';
};

export default function FieldTypesPage() {
    const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
    const [filteredFieldTypes, setFilteredFieldTypes] = useState<FieldType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'id',
        direction: 'ascending'
    });
    const itemsPerPage = 10;
    const router = useRouter();
    const { user } = useAuth();
    const { showError } = useToastHandler();

    const fetchFieldTypes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fieldApi.getFieldTypes();
            setFieldTypes(response);
            setFilteredFieldTypes(response);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching field types:', error);
            const errorMsg = 'Gagal memuat daftar tipe field. Silakan coba lagi.';
            setError(errorMsg);
            showError(error, errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFieldTypes();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchFieldTypes]);

    useEffect(() => {
        let result = [...fieldTypes];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(fieldType =>
                fieldType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fieldType.id.toString().includes(searchQuery)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setFilteredFieldTypes(result);
        setCurrentPage(1);
    }, [fieldTypes, searchQuery, sortConfig]);

    const requestSort = (key: 'id' | 'name') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFieldTypes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFieldTypes.length / itemsPerPage);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
    const handleAddFieldType = () => router.push('/dashboard/fieldtypes/create');
    const handleViewFieldType = (id: number) => router.push(`/dashboard/fieldtypes/${id}`);
    const handleRefresh = () => fetchFieldTypes();

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

    return (
        <div className="container max-w-7xl mx-auto px-4 space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Tipe Field</h1>
                    <p className="text-muted-foreground">Kelola semua tipe field dalam sistem</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Memuat...' : 'Refresh'}
                    </Button>
                    <Button onClick={handleAddFieldType}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Tipe Field
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <CardTitle className="text-lg">Daftar Tipe Field</CardTitle>
                        <div className="w-full md:w-auto">
                            <Input
                                placeholder="Cari tipe field..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full md:w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <RefreshCw className="animate-spin h-8 w-8 text-primary mb-4" />
                            <p className="text-muted-foreground">Memuat data tipe field...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 flex flex-col items-center gap-4">
                            <div className="text-red-500">{error}</div>
                            <Button variant="outline" onClick={handleRefresh}>
                                Coba Lagi
                            </Button>
                        </div>
                    ) : filteredFieldTypes.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center gap-4">
                            <div className="text-muted-foreground">
                                {searchQuery ? 'Tidak ada tipe field yang sesuai' : 'Belum ada tipe field'}
                            </div>
                            <Button onClick={handleAddFieldType}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Tipe Field Pertama
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="relative overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[100px]">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => requestSort('id')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    ID
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => requestSort('name')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    Jenis Lapangan
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[100px]">
                                                <div className="flex justify-end pr-5">Aksi</div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentItems.map((fieldType) => (
                                            <TableRow key={fieldType.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{fieldType.id}</TableCell>
                                                <TableCell className="text-center">{fieldType.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewFieldType(fieldType.id)}
                                                            className="text-primary hover:text-primary"
                                                        >
                                                            Detail
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan{' '}
                                        <span className="font-medium">
                                            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFieldTypes.length)}
                                        </span>{' '}
                                        dari <span className="font-medium">{filteredFieldTypes.length}</span> tipe field
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