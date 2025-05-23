'use client'

import { Employee } from '@/lib/interfaces/interfaces';
import { deleteEmployee, getEmployees } from '@/lib/services/employee-service';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { Button } from './ui/button';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from './ui/table';
import EmployeeModal from './EmployeeModal';
import { useAppContext } from '@/lib/context/context';

const EmployeeTable = () => {
    const { push } = useRouter();

    const { setEmployeeId } = useAppContext();

    // useStates
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sortedEmployees, setSortedEmployees] = useState<Employee[]>([]);

    const [token, setToken] = useState('');

    const [sortBy, setSortBy] = useState("");
    const [sortByJob, setSortByJob] = useState("");
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Get current employees
    const indexOfLastEmployee = currentPage * itemsPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
    const currentEmployees = sortedEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

    // Change page
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Function to get employees
    const handleGetEmployees = async () => {
        try {
            const result: Employee[] | "Not Authorized" = await getEmployees(token);
            // const result: Employee[] | "Not Authorized" = [];
            if (result.toString() === "Not Authorized") {
                localStorage.setItem("Not Authorized", 'true');
                push("/login");
            }

            setEmployees(result as Employee[]);
        } catch (error) {
            console.log("error", error);
        }
    };

    // Updating sort functions
    const changeSortBy = (value: string) => {
        if (value == "name" && sortBy == "name") {
            setSortBy(`${value}-reverse`);
        } else if (value == "hire-date" && sortBy == "hire-date") {
            setSortBy(`${value}-reverse`);
        } else {
            setSortBy(value);
        }

        if (sortByJob) {
            setSortByJob("");
        }
    };

    const changeSortByJob = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy("job-title");

        setSortByJob(e.target.value);
    };

    // Delete employee
    const handleDeleteEmployee = async (id: number) => {
        try {
            if (await deleteEmployee(token, id)) {
                await handleGetEmployees();
            }
        } catch (error) {
            console.log("error", error);
        }
    };

    const handleViewEmployee = async (id: number) => {
        await setEmployeeId(id);

        push('/employee-page');
    };

    // Getting the user token from storage
    useEffect(() => {
        const handleToken = async () => {
            if (localStorage.getItem('user')) {
                setToken(await JSON.parse(localStorage.getItem('user')!).token);
            }
            if (sessionStorage.getItem('user')) {
                setToken(await JSON.parse(sessionStorage.getItem('user')!).token);
            }
        }

        handleToken();
    }, []);

    // Fetching employees after token is set
    useEffect(() => {
        if (token !== '') {
            handleGetEmployees();
        }
    }, [token])

    // Sorting the employees
    useEffect(() => {
        const sortingEmployees = [...employees]; // Create a new array to avoid mutating state directly

        const handleSorting = () => {
            switch (sortBy) {
                case "name":
                    sortingEmployees.sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
                    break;
                case "name-reverse":
                    sortingEmployees.sort((a: Employee, b: Employee) => b.name.localeCompare(a.name));
                    break;
                case "hire-date":
                    sortingEmployees.sort(
                        (a: Employee, b: Employee) => Number(new Date(b.hireDate)) - Number(new Date(a.hireDate))
                    );
                    break;
                case "hire-date-reverse":
                    sortingEmployees.sort(
                        (a: Employee, b: Employee) => Number(new Date(a.hireDate)) - Number(new Date(b.hireDate))
                    );
                    break;
                case "job-title":
                    // Fix the filtering logic
                    const filtered = sortingEmployees.filter((employee: Employee) => employee.jobTitle === sortByJob);
                    setSortedEmployees(filtered);
                    return; // Exit early as we've already set the sorted employees
                default:
                    sortingEmployees.sort((a: Employee, b: Employee) => a.id - b.id);
                    break;
            }
            setSortedEmployees(sortingEmployees);
        };

        handleSorting();

    }, [employees, sortBy, sortByJob]);

    return (
        <>
            {/* Sort by - Start */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-4">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                    <h2 className="text-2xl font-medium text-gray-700 dark:text-white">Add new hire</h2>
                    <EmployeeModal type="Add" employee={null} refreshEmployees={handleGetEmployees} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center">
                        <p className="mr-2 text-sm text-gray-600">Sort by:</p>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="text-sm text-gray-600">
                                    Name
                                    {sortBy === "name" ? <FaCaretDown className="ml-2" /> : sortBy === "name-reverse" ? <FaCaretUp className="ml-2" /> : ""}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => changeSortBy("name")}>A-Z</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeSortBy("name-reverse")}>Z-A</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="text-sm text-gray-600">
                                    Hire date
                                    {sortBy === "hire-date" ? <FaCaretDown className="ml-2" /> : sortBy === "hire-date-reverse" ? <FaCaretUp className="ml-2" /> : ""}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => changeSortBy("hire-date")}>Newest First</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeSortBy("hire-date-reverse")}>Oldest First</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <select
                            className="ml-3 text-sm border rounded p-1"
                            value={sortBy === "job-title" ? sortByJob : ""}
                            onChange={changeSortByJob}
                        >
                            <option value="" disabled>
                                Job title
                            </option>
                            <option value="Customer Support">Customer Support</option>
                            <option value="IT Support Specialist">IT Support Specialist</option>
                            <option value="Software Engineer">Software Engineer</option>
                        </select>
                    </div>
                </div>
            </div>
            {/* Sort by - End */}

            {/* Display table - Start */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className='text-lg'>Employee name</TableHead>
                        <TableHead className='text-lg'>Job Title</TableHead>
                        <TableHead className='text-lg'>Date Hired</TableHead>
                        <TableHead className="text-lg text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentEmployees.length === 0 ? (
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell className="text-center">
                                No Employees
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ) : (
                        currentEmployees.map((employee, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell>{employee.jobTitle}</TableCell>
                                <TableCell>{employee.hireDate}</TableCell>
                                <TableCell className="flex gap-3 justify-end">
                                    <Button onClick={() => handleViewEmployee(employee.id)}>
                                        View
                                    </Button>
                                    <EmployeeModal type="Edit" employee={employee} refreshEmployees={handleGetEmployees} />
                                    <Button variant="destructive" onClick={() => handleDeleteEmployee(employee.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            
            {/* Pagination */}
            {sortedEmployees.length > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            onClick={() => handlePageChange(pageNumber)}
                        >
                            {pageNumber}
                        </Button>
                    ))}
                    
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
            {/* Display table - End */}
        </>
    )
}

export default EmployeeTable