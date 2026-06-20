import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, CircularProgress,
  Grid
} from '@mui/material';
import { Add as AddIcon, Person as PersonIcon, AttachMoney as MoneyIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { axiosPrivate } from '../../api/axios';
import ErrorBoundary from '../../components/ErrorBoundary';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function EmployeesModule() {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  // Forms
  const [empForm, setEmpForm] = useState({ name: '', phone: '', role: '', base_salary: '', join_date: '', address: '' });
  const [attendanceForm, setAttendanceForm] = useState({ date: new Date().toISOString().split('T')[0], records: [] });
  const [salaryForm, setSalaryForm] = useState({ employee: '', amount_paid: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'CASH', remarks: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, salRes] = await Promise.all([
        axiosPrivate.get('/employees/profiles/'),
        axiosPrivate.get('/employees/attendance/'),
        axiosPrivate.get('/employees/salary/')
      ]);
      setEmployees(empRes.data.results || empRes.data);
      setAttendanceRecords(attRes.data.results || attRes.data);
      setSalaryRecords(salRes.data.results || salRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Form Submits
  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post('/employees/profiles/', empForm);
      setEmpModalOpen(false);
      setEmpForm({ name: '', phone: '', role: '', base_salary: '', join_date: '', address: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save employee.');
    }
  };

  const openAttendanceModal = () => {
    // Prep attendance form with all active employees defaulted to PRESENT
    const activeEmps = employees.filter(e => e.is_active);
    setAttendanceForm({
      date: new Date().toISOString().split('T')[0],
      records: activeEmps.map(e => ({ employee: e.id, status: 'PRESENT', remarks: '' }))
    });
    setAttendanceModalOpen(true);
  };

  const handleAttendanceStatusChange = (index, status) => {
    const newRecords = [...attendanceForm.records];
    newRecords[index].status = status;
    setAttendanceForm({ ...attendanceForm, records: newRecords });
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = attendanceForm.records.map(r => ({
        employee: r.employee,
        date: attendanceForm.date,
        status: r.status,
        remarks: r.remarks
      }));
      // Our custom backend allows bulk create via list
      await axiosPrivate.post('/employees/attendance/', payload);
      setAttendanceModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save attendance. Have you already recorded attendance for this date?');
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post('/employees/salary/', salaryForm);
      setSalaryModalOpen(false);
      setSalaryForm({ employee: '', amount_paid: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'CASH', remarks: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save salary record.');
    }
  };

  if (loading && employees.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Employee Management</Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Directory" />
            <Tab label="Attendance" />
            <Tab label="Salary Records" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<PersonIcon />} onClick={() => setEmpModalOpen(true)}>Add Employee</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Base Salary (₹)</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell fontWeight="bold">{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>{emp.phone}</TableCell>
                    <TableCell>{emp.base_salary}/mo</TableCell>
                    <TableCell>{emp.join_date}</TableCell>
                    <TableCell><Chip label={emp.is_active ? 'Active' : 'Inactive'} color={emp.is_active ? 'success' : 'default'} size="small"/></TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && <TableRow><TableCell colSpan={6} align="center">No employees found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="secondary" startIcon={<CheckIcon />} onClick={openAttendanceModal}>Record Attendance</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recorded By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map(att => (
                  <TableRow key={att.id}>
                    <TableCell>{att.date}</TableCell>
                    <TableCell fontWeight="bold">{att.employee_name}</TableCell>
                    <TableCell>
                      <Chip label={att.status} color={att.status === 'PRESENT' ? 'success' : att.status === 'ABSENT' ? 'error' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell>{att.recorded_by_name}</TableCell>
                  </TableRow>
                ))}
                {attendanceRecords.length === 0 && <TableRow><TableCell colSpan={4} align="center">No attendance records found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="success" startIcon={<MoneyIcon />} onClick={() => setSalaryModalOpen(true)}>Record Salary Payment</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Recorded By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryRecords.map(sal => (
                  <TableRow key={sal.id}>
                    <TableCell>{sal.payment_date}</TableCell>
                    <TableCell fontWeight="bold">{sal.employee_name}</TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>{sal.amount_paid}</TableCell>
                    <TableCell>{sal.payment_method}</TableCell>
                    <TableCell>{sal.recorded_by_name}</TableCell>
                  </TableRow>
                ))}
                {salaryRecords.length === 0 && <TableRow><TableCell colSpan={5} align="center">No salary records found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Modals */}
      <Dialog open={empModalOpen} onClose={() => setEmpModalOpen(false)}>
        <DialogTitle>Add New Employee</DialogTitle>
        <form onSubmit={handleEmpSubmit}>
          <DialogContent dividers>
            <TextField label="Name" fullWidth required margin="normal" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} />
            <TextField label="Phone" fullWidth required margin="normal" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} />
            <TextField label="Role (e.g., Driver, Helper)" fullWidth required margin="normal" value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} />
            <TextField label="Monthly Base Salary (₹)" type="number" fullWidth required margin="normal" value={empForm.base_salary} onChange={e => setEmpForm({...empForm, base_salary: e.target.value})} />
            <TextField label="Join Date" type="date" fullWidth required margin="normal" InputLabelProps={{ shrink: true }} value={empForm.join_date} onChange={e => setEmpForm({...empForm, join_date: e.target.value})} />
            <TextField label="Address" fullWidth multiline rows={2} margin="normal" value={empForm.address} onChange={e => setEmpForm({...empForm, address: e.target.value})} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmpModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={attendanceModalOpen} onClose={() => setAttendanceModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Daily Attendance</DialogTitle>
        <form onSubmit={handleAttendanceSubmit}>
          <DialogContent dividers>
            <TextField label="Date" type="date" fullWidth required margin="normal" InputLabelProps={{ shrink: true }} value={attendanceForm.date} onChange={e => setAttendanceForm({...attendanceForm, date: e.target.value})} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Employees</Typography>
              {attendanceForm.records.map((record, idx) => {
                const emp = employees.find(e => e.id === record.employee);
                return (
                  <Grid container spacing={2} alignItems="center" key={record.employee} sx={{ mb: 1 }}>
                    <Grid item xs={5}><Typography>{emp?.name}</Typography></Grid>
                    <Grid item xs={7}>
                      <TextField select fullWidth size="small" value={record.status} onChange={e => handleAttendanceStatusChange(idx, e.target.value)}>
                        <MenuItem value="PRESENT">Present</MenuItem>
                        <MenuItem value="ABSENT">Absent</MenuItem>
                        <MenuItem value="HALF_DAY">Half Day</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAttendanceModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary">Submit Attendance</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={salaryModalOpen} onClose={() => setSalaryModalOpen(false)}>
        <DialogTitle>Record Salary Payment</DialogTitle>
        <form onSubmit={handleSalarySubmit}>
          <DialogContent dividers>
            <TextField select label="Employee" fullWidth required margin="normal" value={salaryForm.employee} onChange={e => setSalaryForm({...salaryForm, employee: e.target.value})}>
              {employees.filter(e => e.is_active).map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
            </TextField>
            <TextField label="Amount Paid (₹)" type="number" inputProps={{ step: "0.01" }} fullWidth required margin="normal" value={salaryForm.amount_paid} onChange={e => setSalaryForm({...salaryForm, amount_paid: e.target.value})} />
            <TextField label="Payment Date" type="date" fullWidth required margin="normal" InputLabelProps={{ shrink: true }} value={salaryForm.payment_date} onChange={e => setSalaryForm({...salaryForm, payment_date: e.target.value})} />
            <TextField select label="Payment Method" fullWidth required margin="normal" value={salaryForm.payment_method} onChange={e => setSalaryForm({...salaryForm, payment_method: e.target.value})}>
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </TextField>
            <TextField label="Remarks" fullWidth margin="normal" value={salaryForm.remarks} onChange={e => setSalaryForm({...salaryForm, remarks: e.target.value})} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSalaryModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="success">Record Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default function EmployeesModuleWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <EmployeesModule />
    </ErrorBoundary>
  );
}
