# Backend Integration Guide - Technician Assignment System

## 🚨 CRITICAL: Next Steps Required

This document outlines the **immediate actions needed** to complete the technician assignment system implementation. The frontend is fully prepared and waiting for backend API endpoints.

---

## 📋 Current Status

### ✅ Frontend Implementation Complete
- **Type System**: All TypeScript interfaces defined
- **Service Layer**: Complete API integration ready
- **Redux State**: Async thunks and state management implemented
- **UI Components**: Fully functional with proper error handling
- **Testing Tools**: Comprehensive diagnostic suite available

### ❌ Backend Implementation Required
The following API endpoints are **missing** and must be implemented:

---

## 🔧 Required Backend API Endpoints

### 1. Assign Technician to Appointment
```http
POST /api/shop/appointments/{appointment_id}/assign-technician/
```

**Request Body:**
```json
{
  "technician_id": 123
}
```

**Response:**
```json
{
  "id": 456,
  "status": "assigned",
  "assigned_technician_id": 123,
  "assigned_at": "2025-09-14T10:30:00Z",
  "assigned_technician": {
    "id": 123,
    "first_name": "John",
    "last_name": "Smith",
    "position": "Senior Technician",
    "email": "john.smith@shop.com"
  },
  "customer_id": 789,
  "vehicle_id": 101,
  "date": "2025-09-14T14:00:00Z",
  "description": "Oil change and inspection",
  "notes": "",
  "started_at": null,
  "completed_at": null,
  "customer": { /* customer object */ },
  "vehicle": { /* vehicle object */ },
  "created_at": "2025-09-14T09:00:00Z",
  "updated_at": "2025-09-14T10:30:00Z"
}
```

### 2. Start Work on Appointment
```http
POST /api/shop/appointments/{appointment_id}/start-work/
```

**Request Body:** `{}` (empty)

**Response:**
```json
{
  "id": 456,
  "status": "in_progress",
  "assigned_technician_id": 123,
  "assigned_at": "2025-09-14T10:30:00Z",
  "started_at": "2025-09-14T11:00:00Z",
  "assigned_technician": { /* technician object */ },
  /* ... other appointment fields ... */
}
```

### 3. Complete Work on Appointment
```http
POST /api/shop/appointments/{appointment_id}/complete-work/
```

**Request Body:** `{}` (empty)

**Response:**
```json
{
  "id": 456,
  "status": "completed",
  "assigned_technician_id": 123,
  "assigned_at": "2025-09-14T10:30:00Z",
  "started_at": "2025-09-14T11:00:00Z",
  "completed_at": "2025-09-14T15:30:00Z",
  "assigned_technician": { /* technician object */ },
  /* ... other appointment fields ... */
}
```

### 4. Get Technician Workload Overview
```http
GET /api/shop/technicians/workload/
```

**Response:**
```json
{
  "technicians": [
    {
      "id": 123,
      "first_name": "John",
      "last_name": "Smith",
      "position": "Senior Technician",
      "email": "john.smith@shop.com",
      "current_workload": 3,
      "max_capacity": 5,
      "availability_score": 0.4,
      "current_jobs": [
        {
          "appointment_id": 456,
          "customer_name": "Jane Doe",
          "vehicle": "2020 Toyota Camry",
          "service_type": "Oil Change",
          "status": "in_progress",
          "started_at": "2025-09-14T11:00:00Z",
          "estimated_completion": "2025-09-14T16:00:00Z"
        }
      ]
    }
  ],
  "summary": {
    "total_technicians": 5,
    "available_technicians": 3,
    "busy_technicians": 2,
    "total_active_jobs": 8,
    "average_workload": 0.6
  }
}
```

---

## 🗄️ Database Schema Requirements

### Appointment Model Updates
The `appointments` table must include these fields:

```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_technician_id INTEGER REFERENCES employees(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NULL;  
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_technician ON appointments(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
```

### Status Field Values
```sql
-- Valid status values
CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled'))
```

---

## 🐍 Django Implementation Example

### Views Implementation

```python
# views/technician_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from .models import Appointment, Employee
from .serializers import AppointmentSerializer, TechnicianWorkloadSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_technician(request, appointment_id):
    """Assign a technician to an appointment"""
    try:
        with transaction.atomic():
            appointment = get_object_or_404(Appointment, id=appointment_id)
            technician_id = request.data.get('technician_id')
            
            if not technician_id:
                return Response(
                    {'error': 'technician_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            technician = get_object_or_404(Employee, id=technician_id)
            
            # Validate current status
            if appointment.status != 'pending':
                return Response(
                    {'error': f'Cannot assign technician to appointment with status: {appointment.status}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update appointment
            appointment.assigned_technician = technician
            appointment.assigned_at = timezone.now()
            appointment.status = 'assigned'
            appointment.save()
            
            # Serialize and return
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_work(request, appointment_id):
    """Start work on an assigned appointment"""
    try:
        with transaction.atomic():
            appointment = get_object_or_404(Appointment, id=appointment_id)
            
            # Validate current status
            if appointment.status != 'assigned':
                return Response(
                    {'error': f'Cannot start work on appointment with status: {appointment.status}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update appointment
            appointment.started_at = timezone.now()
            appointment.status = 'in_progress'
            appointment.save()
            
            # Serialize and return
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_work(request, appointment_id):
    """Complete work on an in-progress appointment"""
    try:
        with transaction.atomic():
            appointment = get_object_or_404(Appointment, id=appointment_id)
            
            # Validate current status
            if appointment.status != 'in_progress':
                return Response(
                    {'error': f'Cannot complete appointment with status: {appointment.status}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update appointment
            appointment.completed_at = timezone.now()
            appointment.status = 'completed'
            appointment.save()
            
            # Serialize and return
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def technician_workload(request):
    """Get workload overview for all technicians"""
    try:
        technicians = Employee.objects.filter(
            role='technician'
        ).prefetch_related('assigned_appointments')
        
        workload_data = []
        total_technicians = technicians.count()
        busy_count = 0
        total_jobs = 0
        
        for tech in technicians:
            current_jobs = tech.assigned_appointments.filter(
                status__in=['assigned', 'in_progress']
            )
            
            current_workload = current_jobs.count()
            max_capacity = 5  # Configure as needed
            
            if current_workload > 0:
                busy_count += 1
            
            total_jobs += current_workload
            
            workload_data.append({
                'id': tech.id,
                'first_name': tech.first_name,
                'last_name': tech.last_name,
                'position': tech.position,
                'email': tech.email,
                'current_workload': current_workload,
                'max_capacity': max_capacity,
                'availability_score': 1 - (current_workload / max_capacity),
                'current_jobs': [
                    {
                        'appointment_id': job.id,
                        'customer_name': f"{job.customer.first_name} {job.customer.last_name}",
                        'vehicle': f"{job.vehicle.year} {job.vehicle.make} {job.vehicle.model}",
                        'service_type': job.description,
                        'status': job.status,
                        'started_at': job.started_at,
                        'estimated_completion': job.date  # or calculate based on service
                    }
                    for job in current_jobs
                ]
            })
        
        response_data = {
            'technicians': workload_data,
            'summary': {
                'total_technicians': total_technicians,
                'available_technicians': total_technicians - busy_count,
                'busy_technicians': busy_count,
                'total_active_jobs': total_jobs,
                'average_workload': total_jobs / total_technicians if total_technicians > 0 else 0
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

### URL Configuration

```python
# urls.py
from django.urls import path
from .views import technician_views

urlpatterns = [
    # Existing patterns...
    
    # Technician assignment endpoints
    path('appointments/<int:appointment_id>/assign-technician/', 
         technician_views.assign_technician, 
         name='assign_technician'),
    
    path('appointments/<int:appointment_id>/start-work/', 
         technician_views.start_work, 
         name='start_work'),
    
    path('appointments/<int:appointment_id>/complete-work/', 
         technician_views.complete_work, 
         name='complete_work'),
    
    path('technicians/workload/', 
         technician_views.technician_workload, 
         name='technician_workload'),
]
```

---

## 🧪 Testing Instructions

### 1. **Immediate Testing** (Before Backend Implementation)
Run the frontend API tester to confirm 404 errors:

```bash
# Open browser to test endpoints
http://localhost:3001/technician-api-tester.html
```

**Expected Results**: All endpoints should return **404 Not Found**

### 2. **Post-Implementation Testing**
After implementing backend endpoints:

1. **Start both servers:**
   ```bash
   # Backend (Django)
   python manage.py runserver 8000
   
   # Frontend (React)
   npm run dev
   ```

2. **Run API tests:**
   - Open: http://localhost:3001/technician-api-tester.html
   - Click "Initialize Test Data"
   - Click "Run All Tests"

3. **Expected Results:**
   - ✅ GET `/shop/employees/?role=technician` → 200 OK
   - ✅ GET `/shop/technicians/workload/` → 200 OK  
   - ✅ POST `/shop/appointments/{id}/assign-technician/` → 200 OK
   - ✅ POST `/shop/appointments/{id}/start-work/` → 200 OK
   - ✅ POST `/shop/appointments/{id}/complete-work/` → 200 OK

### 3. **Integration Testing**
Test the complete workflow in the React app:

1. Navigate to appointment management
2. Find a pending appointment
3. Click "Assign Technician" → Select technician → Assign
4. Click "Start Work" 
5. Click "Complete Work"

---

## 🚨 Common Issues & Solutions

### Issue: 404 Not Found
**Cause**: Backend endpoints not implemented
**Solution**: Implement the required views and URL patterns above

### Issue: 400 Bad Request - Invalid Status
**Cause**: Trying to transition appointment to invalid status
**Solution**: Ensure proper status workflow (pending → assigned → in_progress → completed)

### Issue: 401 Unauthorized
**Cause**: Authentication token issues
**Solution**: Verify JWT token is being passed correctly in Authorization header

### Issue: 422 Unprocessable Entity
**Cause**: Request data validation errors
**Solution**: Check request body format matches expected schema

### Issue: 500 Internal Server Error
**Cause**: Backend database or code errors
**Solution**: Check backend logs for specific error details

---

## 📞 Support & Contact

### Frontend Development Status
- ✅ **Complete and Ready**: All frontend code implemented and tested
- ✅ **API Integration**: Service layer ready for backend endpoints
- ✅ **Testing Tools**: Comprehensive diagnostic suite available

### Backend Development Required
- ❌ **API Endpoints**: Must implement 4 required endpoints
- ❌ **Database Schema**: Must add required fields to appointments table
- ❌ **URL Routing**: Must add endpoint routes to Django URLs

### Testing Validation
Use the provided testing tools to validate each endpoint as it's implemented. The frontend team has prepared comprehensive diagnostic tools to ensure smooth integration.

---

**📋 NEXT ACTION ITEMS:**

1. **Backend Developer**: Implement the 4 required API endpoints using the Django code examples above
2. **Database Admin**: Run the SQL schema updates for the appointments table  
3. **DevOps**: Ensure both frontend (port 3000) and backend (port 8000) are running
4. **QA Team**: Use the testing tools at http://localhost:3001/technician-api-tester.html to validate integration

**🎯 SUCCESS CRITERIA:** All API tests return 200 OK responses and the technician workflow functions end-to-end in the React application.