# 🚨 MISSING BACKEND ENDPOINT SPECIFICATION

## 📋 For Backend Developer: Services Management API Required

**Date:** August 24, 2025  
**Priority:** HIGH  
**Current Status:** Potentially ❌ 404 Not Found  
**Frontend Status:** ✅ Ready and waiting for this endpoint  

---

## 🎯 **ENDPOINT SPECIFICATION**

### **Required Endpoints**
```
GET    /api/shop/services/                    # List all services
POST   /api/shop/services/                    # Create new service
GET    /api/shop/services/{id}/               # Get specific service
PUT    /api/shop/services/{id}/               # Update specific service
DELETE /api/shop/services/{id}/               # Delete specific service
```

### **Authentication**
- **Required**: YES - JWT Bearer token
- **Access Level**: Employee and Owner roles (not Customer)

### **Purpose**
These endpoints manage repair services offered by the shop. Used for:
- Service selection during repair order creation
- Service catalog management
- Pricing and labor cost tracking
- Service category organization

---

## 📊 **DATA MODEL SPECIFICATION**

### **Service Database Fields**
```python
# Suggested Django model structure
class Service(models.Model):
    id = models.AutoField(primary_key=True)
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE)  # Associated shop
    name = models.CharField(max_length=200)                     # Service name
    description = models.TextField(blank=True)                  # Service description
    category = models.CharField(max_length=100, blank=True)     # Service category
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2) # Labor cost
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Alternative price
    taxable = models.BooleanField(default=True)                 # Is taxable
    warranty_months = models.IntegerField(default=0)            # Warranty period
    is_active = models.BooleanField(default=True)               # Active status
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
```

---

## 📋 **API ENDPOINT DETAILS**

### **1. GET /api/shop/services/ - List Services**

#### **Query Parameters**
- `search` (string): Search in name, description
- `category` (string): Filter by service category
- `shop` (integer): Filter by shop ID
- `is_active` (boolean): Filter by active status
- `taxable` (boolean): Filter by taxable status
- `limit` (integer): Number of results per page
- `offset` (integer): Pagination offset

#### **Response Format**
```json
{
  "count": 45,
  "next": "http://127.0.0.1:8000/api/shop/services/?limit=20&offset=20",
  "previous": null,
  "results": [
    {
      "id": 1,
      "shop": 1,
      "name": "Oil Change",
      "description": "Complete oil and filter change service",
      "category": "Maintenance",
      "labor_cost": "45.00",
      "price": "45.00",
      "taxable": true,
      "warranty_months": 3,
      "is_active": true,
      "created_at": "2025-08-20T10:30:00Z",
      "updated_at": "2025-08-23T14:15:00Z"
    },
    {
      "id": 2,
      "shop": 1,
      "name": "Brake Inspection",
      "description": "Comprehensive brake system inspection",
      "category": "Safety",
      "labor_cost": "75.00",
      "price": "75.00",
      "taxable": true,
      "warranty_months": 6,
      "is_active": true,
      "created_at": "2025-08-20T10:30:00Z",
      "updated_at": "2025-08-23T14:15:00Z"
    }
  ]
}
```

### **2. POST /api/shop/services/ - Create Service**

#### **Request Body**
```json
{
  "shop": 1,
  "name": "Tire Rotation",
  "description": "Rotate tires to ensure even wear",
  "category": "Maintenance",
  "labor_cost": "35.00",
  "price": "35.00",
  "taxable": true,
  "warranty_months": 1
}
```

#### **Response**
- **Success**: `201 Created` with created service object
- **Validation Error**: `400 Bad Request` with error details

### **3. GET /api/shop/services/{id}/ - Get Single Service**

#### **Response**
```json
{
  "id": 1,
  "shop": 1,
  "name": "Oil Change",
  "description": "Complete oil and filter change service",
  "category": "Maintenance",
  "labor_cost": "45.00",
  "price": "45.00",
  "taxable": true,
  "warranty_months": 3,
  "is_active": true,
  "created_at": "2025-08-20T10:30:00Z",
  "updated_at": "2025-08-23T14:15:00Z"
}
```

### **4. PUT /api/shop/services/{id}/ - Update Service**

#### **Request Body** (partial updates allowed)
```json
{
  "labor_cost": "50.00",
  "price": "50.00",
  "warranty_months": 6
}
```

### **5. DELETE /api/shop/services/{id}/ - Delete Service**

#### **Response**
- **Success**: `204 No Content`
- **Not Found**: `404 Not Found`

---

## 🔧 **BUSINESS LOGIC REQUIREMENTS**

### **Service Categories**
Common service categories:
- **Maintenance**: Oil change, tire rotation, filter replacement
- **Safety**: Brake inspection, light check, safety inspection
- **Repair**: Engine repair, transmission service, suspension work
- **Diagnostic**: Computer diagnosis, troubleshooting
- **Emergency**: Towing, roadside assistance

### **Pricing Structure**
1. **Labor Cost**: Base cost for the service
2. **Price**: Customer-facing price (may include markup)
3. **Taxable**: Whether service is subject to sales tax
4. **Warranty**: Warranty period in months

### **Integration Points**
1. **Repair Orders**: Services selected during repair order creation
2. **Pricing Calculations**: Labor costs for estimates
3. **Service History**: Track services performed
4. **Warranty Tracking**: Monitor warranty periods

---

## 🏗️ **IMPLEMENTATION GUIDANCE**

### **Django Implementation Example**
```python
# serializers.py
from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'id', 'shop', 'name', 'description', 'category',
            'labor_cost', 'price', 'taxable', 'warranty_months',
            'is_active', 'created_at', 'updated_at'
        ]

# views.py
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['category', 'shop', 'is_active', 'taxable']
    
    def get_queryset(self):
        return Service.objects.filter(is_active=True).order_by('category', 'name')

# urls.py
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet

router = DefaultRouter()
router.register(r'shop/services', ServiceViewSet)
urlpatterns = router.urls
```

### **Database Migration**
```python
# migration file
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('shop', '0002_part_model'),
    ]
    
    operations = [
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(blank=True, max_length=100)),
                ('labor_cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('taxable', models.BooleanField(default=True)),
                ('warranty_months', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('shop', models.ForeignKey(on_delete=models.deletion.CASCADE, to='shop.shop')),
            ],
            options={
                'ordering': ['category', 'name'],
            },
        ),
    ]
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Manual Testing**
```bash
# Test list services
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/shop/services/

# Test search
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "http://127.0.0.1:8000/api/shop/services/?search=oil&category=Maintenance"

# Test create service
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"shop":1,"name":"Test Service","category":"Test","labor_cost":"25.00","taxable":true,"warranty_months":1}' \
     http://127.0.0.1:8000/api/shop/services/
```

### **Validation Requirements**
- [ ] Authentication required for all endpoints
- [ ] Customer role denied access (403 Forbidden)
- [ ] Service names should be descriptive
- [ ] Labor cost must be positive decimal
- [ ] Warranty months must be non-negative integer
- [ ] Shop association required
- [ ] Search functionality working across name/description

---

## 📞 **SAMPLE DATA FOR DEVELOPMENT**

```python
# Sample services data for testing
sample_services = [
    {
        'name': 'Oil Change',
        'description': 'Complete oil and filter change',
        'category': 'Maintenance',
        'labor_cost': 45.00,
        'taxable': True,
        'warranty_months': 3
    },
    {
        'name': 'Brake Inspection',
        'description': 'Comprehensive brake system check',
        'category': 'Safety',
        'labor_cost': 75.00,
        'taxable': True,
        'warranty_months': 6
    },
    {
        'name': 'Engine Diagnostic',
        'description': 'Computer diagnostic scan',
        'category': 'Diagnostic',
        'labor_cost': 120.00,
        'taxable': True,
        'warranty_months': 1
    },
    {
        'name': 'Tire Rotation',
        'description': 'Rotate tires for even wear',
        'category': 'Maintenance',
        'labor_cost': 35.00,
        'taxable': True,
        'warranty_months': 1
    }
]
```

---

## ✅ **SUCCESS CRITERIA**

The endpoints will be considered complete when:
- [ ] All CRUD operations working
- [ ] Authentication and authorization implemented
- [ ] Search and filtering functional
- [ ] Frontend can load services successfully
- [ ] Service categories properly organized
- [ ] Performance acceptable (< 1 second response)
- [ ] Decimal pricing fields properly handled

**Priority**: HIGH - This blocks repair order creation and service management.

**Estimated Backend Work**: 3-4 hours including model creation, ViewSet implementation, and testing.
