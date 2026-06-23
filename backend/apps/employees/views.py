from rest_framework import viewsets, status
from apps.authentication.permissions import IsAuthenticatedStaffOrReadOnly as IsAuthenticated
from rest_framework.response import Response
from .models import Employee, EmployeeAttendance, EmployeeSalaryRecord
from .serializers import EmployeeSerializer, EmployeeAttendanceSerializer, EmployeeSalaryRecordSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

class EmployeeAttendanceViewSet(viewsets.ModelViewSet):
    queryset = EmployeeAttendance.objects.all()
    serializer_class = EmployeeAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        # We can handle bulk creation if data is a list
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        return super().create(request, *args, **kwargs)

class EmployeeSalaryRecordViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSalaryRecord.objects.all()
    serializer_class = EmployeeSalaryRecordSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
