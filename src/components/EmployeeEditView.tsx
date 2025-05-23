'use client'

import { Employee } from '@/lib/interfaces/interfaces'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { updateEmployeeDetails } from '@/lib/services/employee-service'

const EmployeeEditView = ({ employee, setEdit }: { employee: Employee, setEdit: (value: boolean) => void }) => {
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee>(employee);
    const [token, setToken] = useState('');

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setEmployeeToEdit(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle date change
    const formatDateFromInput = (date: Date | undefined) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Handle save
    const handleSave = async () => {
        try {
            if (await updateEmployeeDetails(token, employeeToEdit)) {
                setEdit(false);
            }
        } catch (error) {
            console.error("Error updating employee:", error);
        }
    };

    // Get token on mount
    React.useEffect(() => {
        const getToken = () => {
            if (localStorage.getItem('user')) {
                setToken(JSON.parse(localStorage.getItem('user')!).token);
            }
            if (sessionStorage.getItem('user')) {
                setToken(JSON.parse(sessionStorage.getItem('user')!).token);
            }
        };
        getToken();
    }, []);

    return (
        <>
            <div>
                <p className="text-sm font-semibold">Job Title</p>
                <Input 
                    value={employeeToEdit.jobTitle} 
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                />
            </div>

            <div>
                <p className="text-sm font-semibold">Details</p>
                <Input 
                    value={employeeToEdit.details || ""} 
                    onChange={(e) => handleInputChange('details', e.target.value)}
                />
            </div>

            <div>
                <p className="text-sm font-semibold">Status</p>
                <Select 
                    value={employeeToEdit.status || ""} 
                    onValueChange={(value) => handleInputChange('status', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Sick">Sick</SelectItem>
                            <SelectItem value="Out of Office">Out of Office</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <p className="text-sm font-semibold">Hire Date</p>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", 
                                !employeeToEdit.hireDate && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {employeeToEdit.hireDate || "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={employeeToEdit.hireDate ? new Date(employeeToEdit.hireDate) : undefined}
                            onSelect={(date) => handleInputChange('hireDate', formatDateFromInput(date))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex justify-between pt-4">
                <Button onClick={() => setEdit(false)}>Cancel</Button>
                <Button variant="outline" onClick={handleSave}>Save Edits</Button>
            </div>
        </>
    )
}

export default EmployeeEditView