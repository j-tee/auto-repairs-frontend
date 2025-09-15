# Backend Developer Checklist - Technician Assignment System

## 🎯 Quick Implementation Checklist

### ⚡ Immediate Actions Required

- [ ] **Database Schema Updates**
  - [ ] Add `assigned_technician_id` field to appointments table
  - [ ] Add `assigned_at` timestamp field
  - [ ] Add `started_at` timestamp field  
  - [ ] Add `completed_at` timestamp field
  - [ ] Update `status` field to support: pending, assigned, in_progress, completed
  - [ ] Add database indexes for performance

- [ ] **API Endpoint Implementation**
  - [ ] `POST /api/shop/appointments/{id}/assign-technician/`
  - [ ] `POST /api/shop/appointments/{id}/start-work/`
  - [ ] `POST /api/shop/appointments/{id}/complete-work/`
  - [ ] `GET /api/shop/technicians/workload/`

- [ ] **Django URL Routing**
  - [ ] Add new URL patterns to urls.py
  - [ ] Test URL routing with Django admin or curl

- [ ] **Validation & Testing**
  - [ ] Test each endpoint with Postman/curl
  - [ ] Verify status transition logic works
  - [ ] Test with invalid data (400 errors expected)
  - [ ] Test authentication (401 errors for no token)

---

## 🚀 30-Second Database Setup

```sql
-- Copy and paste into your Django migrations or SQL console
ALTER TABLE appointments ADD COLUMN assigned_technician_id INTEGER REFERENCES employees(id);
ALTER TABLE appointments ADD COLUMN assigned_at TIMESTAMP NULL;
ALTER TABLE appointments ADD COLUMN started_at TIMESTAMP NULL;
ALTER TABLE appointments ADD COLUMN completed_at TIMESTAMP NULL;
ALTER TABLE appointments ADD COLUMN status VARCHAR(20) DEFAULT 'pending';

-- Performance indexes
CREATE INDEX idx_appointments_technician ON appointments(assigned_technician_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```

---

## 🐍 5-Minute Django Implementation

### 1. Create the views file:
```bash
touch your_app/views/technician_views.py
```

### 2. Copy this code into `technician_views.py`:
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from ..models import Appointment, Employee
from ..serializers import AppointmentSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_technician(request, appointment_id):
    with transaction.atomic():
        appointment = get_object_or_404(Appointment, id=appointment_id)
        technician_id = request.data.get('technician_id')
        technician = get_object_or_404(Employee, id=technician_id)
        
        if appointment.status != 'pending':
            return Response({'error': 'Invalid status'}, status=400)
        
        appointment.assigned_technician = technician
        appointment.assigned_at = timezone.now()
        appointment.status = 'assigned'
        appointment.save()
        
        return Response(AppointmentSerializer(appointment).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_work(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    
    if appointment.status != 'assigned':
        return Response({'error': 'Invalid status'}, status=400)
    
    appointment.started_at = timezone.now()
    appointment.status = 'in_progress'
    appointment.save()
    
    return Response(AppointmentSerializer(appointment).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_work(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    
    if appointment.status != 'in_progress':
        return Response({'error': 'Invalid status'}, status=400)
    
    appointment.completed_at = timezone.now()
    appointment.status = 'completed'
    appointment.save()
    
    return Response(AppointmentSerializer(appointment).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def technician_workload(request):
    technicians = Employee.objects.filter(role='technician')
    data = {
        'technicians': [
            {
                'id': t.id,
                'first_name': t.first_name,
                'last_name': t.last_name,
                'position': t.position,
                'current_workload': t.assigned_appointments.filter(
                    status__in=['assigned', 'in_progress']
                ).count()
            }
            for t in technicians
        ]
    }
    return Response(data)
```

### 3. Add to your main `urls.py`:
```python
from .views import technician_views

urlpatterns = [
    # ... existing patterns
    path('appointments/<int:appointment_id>/assign-technician/', technician_views.assign_technician),
    path('appointments/<int:appointment_id>/start-work/', technician_views.start_work),
    path('appointments/<int:appointment_id>/complete-work/', technician_views.complete_work),
    path('technicians/workload/', technician_views.technician_workload),
]
```

---

## 🧪 Instant Testing

### Test with curl (replace with actual values):
```bash
# Get auth token first
TOKEN="your_jwt_token_here"
BASE_URL="http://localhost:8000/api/shop"

# Test assign technician
curl -X POST "$BASE_URL/appointments/1/assign-technician/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"technician_id": 2}'

# Test start work  
curl -X POST "$BASE_URL/appointments/1/start-work/" \
  -H "Authorization: Bearer $TOKEN"

# Test complete work
curl -X POST "$BASE_URL/appointments/1/complete-work/" \
  -H "Authorization: Bearer $TOKEN"

# Test workload
curl -X GET "$BASE_URL/technicians/workload/" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Validation Steps

### 1. Database Check
```sql
-- Verify schema changes applied
\d appointments  -- PostgreSQL
-- or
DESCRIBE appointments;  -- MySQL
-- or  
PRAGMA table_info(appointments);  -- SQLite
```

### 2. Django Check
```bash
python manage.py check  # Should show no errors
python manage.py makemigrations  # Create migration files
python manage.py migrate  # Apply changes
```

### 3. API Check
Visit: http://localhost:3001/technician-api-tester.html
- Should show 200 OK responses instead of 404 errors

---

## 🔥 Common Gotchas

### ❌ Mistake 1: Wrong model field names
**Problem**: Using `technician_id` instead of `assigned_technician`
**Fix**: Match your model field names exactly

### ❌ Mistake 2: Missing foreign key reference
**Problem**: `assigned_technician_id` field not linked to Employee table
**Fix**: Ensure proper ForeignKey relationship in Django model

### ❌ Mistake 3: Serializer doesn't include new fields
**Problem**: API response missing `assigned_at`, `started_at` fields
**Fix**: Update AppointmentSerializer to include all fields

### ❌ Mistake 4: URL pattern doesn't match frontend calls
**Problem**: Frontend calls `/shop/appointments/` but backend has `/api/appointments/`
**Fix**: Ensure URL base matches exactly: `/api/shop/appointments/`

---

## 🎯 Success Criteria

### ✅ You're done when:
1. **Database**: All new fields exist and have proper constraints
2. **APIs**: All 4 endpoints return 200 OK with valid JSON
3. **Frontend Test**: http://localhost:3001/technician-api-tester.html shows all green checkmarks
4. **Workflow**: Can assign → start → complete an appointment end-to-end

### 🚨 Red flags:
- Any 404 errors = URL routing issue
- Any 500 errors = Backend code/database issue  
- Any 400 errors with valid data = Model/serializer issue
- Frontend buttons still not working = API response format issue

---

## 📞 Need Help?

### Debugging Tips:
1. **Check Django logs**: Look for error messages in console
2. **Test URLs directly**: Visit `/admin/` to verify models work
3. **Use Django shell**: Test model operations manually
4. **Check migrations**: Ensure database changes applied

### Frontend Team Contact:
- All frontend code is **complete and tested**
- Use the testing tools provided
- If API tests pass but buttons don't work, it's likely a response format issue

**⏰ Estimated Implementation Time**: 15-30 minutes for experienced Django developer