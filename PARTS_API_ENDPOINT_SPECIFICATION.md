# 🚨 MISSING BACKEND ENDPOINT SPECIFICATION

## 📋 For Backend Developer: Parts Management API Required

**Date:** August 24, 2025  
**Priority:** HIGH  
**Current Status:** ❌ 404 Not Found  
**Frontend Status:** ✅ Ready and waiting for this endpoint  

---

## 🎯 **ENDPOINT SPECIFICATION**

### **Required Endpoints**
```
GET    /api/shop/parts/               # List all parts
POST   /api/shop/parts/               # Create new part
GET    /api/shop/parts/{id}/          # Get specific part
PUT    /api/shop/parts/{id}/          # Update specific part
DELETE /api/shop/parts/{id}/          # Delete specific part
```

### **Authentication**
- **Required**: YES - JWT Bearer token
- **Access Level**: Employee and Owner roles (not Customer)

### **Purpose**
These endpoints manage auto parts inventory for the repair shop system. Used for:
- Parts selection during repair order creation
- Inventory management and stock tracking
- Parts availability checking
- Price and cost management

---

## 📊 **DATA MODEL SPECIFICATION**

### **Part Database Fields**
```python
# Suggested Django model structure
class Part(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)                    # Part name
    part_number = models.CharField(max_length=100, unique=True) # Manufacturer part number
    description = models.TextField(blank=True)                 # Detailed description
    brand = models.CharField(max_length=100)                   # Manufacturer/brand
    category = models.CharField(max_length=100)                # Part category
    price = models.DecimalField(max_digits=10, decimal_places=2) # Selling price
    cost = models.DecimalField(max_digits=10, decimal_places=2)  # Purchase cost
    quantity = models.IntegerField(default=0)                  # Current stock
    stock_quantity = models.IntegerField(default=0)            # Alias for quantity
    minimum_stock = models.IntegerField(default=0)             # Reorder threshold
    location = models.CharField(max_length=100, blank=True)    # Storage location
    is_active = models.BooleanField(default=True)              # Active status
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE) # Associated shop
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
```

---

## 📋 **API ENDPOINT DETAILS**

### **1. GET /api/parts/ - List Parts**

#### **Query Parameters**
- `search` (string): Search in name, part_number, description
- `category` (string): Filter by part category
- `brand` (string): Filter by brand/manufacturer
- `shop_id` (integer): Filter by shop ID
- `is_active` (boolean): Filter by active status
- `low_stock` (boolean): If true, show only parts below minimum stock
- `limit` (integer): Number of results per page
- `offset` (integer): Pagination offset

#### **Response Format**
```json
{
  "count": 156,
  "next": "http://127.0.0.1:8000/api/shop/parts/?limit=20&offset=20",
  "previous": null,
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Oil Filter",
      "part_number": "OF-2024-TOYOTA",
      "description": "High-quality oil filter for Toyota vehicles",
      "brand": "Toyota",
      "category": "Filters",
      "price": "15.99",
      "cost": "8.50",
      "quantity": 45,
      "stock_quantity": 45,
      "minimum_stock": 10,
      "location": "Shelf A-12",
      "is_active": true,
      "shop": 1,
      "created_at": "2025-08-20T10:30:00Z",
      "updated_at": "2025-08-23T14:15:00Z"
    }
  ]
}
```

### **2. POST /api/parts/ - Create Part**

#### **Request Body**
```json
{
  "name": "Brake Pad Set",
  "part_number": "BP-2024-HONDA",
  "description": "Premium ceramic brake pads for Honda Civic",
  "brand": "Honda",
  "category": "Brakes",
  "price": "89.99",
  "cost": "45.00",
  "quantity": 20,
  "minimum_stock": 5,
  "location": "Shelf B-8",
  "shop": 1,
  "is_active": true
}
```

#### **Response**
- **Success**: `201 Created` with created part object
- **Validation Error**: `400 Bad Request` with error details

### **3. GET /api/parts/{id}/ - Get Single Part**

#### **Response**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Oil Filter",
  "part_number": "OF-2024-TOYOTA",
  "description": "High-quality oil filter for Toyota vehicles",
  "brand": "Toyota",
  "category": "Filters",
  "price": "15.99",
  "cost": "8.50",
  "quantity": 45,
  "stock_quantity": 45,
  "minimum_stock": 10,
  "location": "Shelf A-12",
  "is_active": true,
  "shop": 1,
  "created_at": "2025-08-20T10:30:00Z",
  "updated_at": "2025-08-23T14:15:00Z"
}
```

### **4. PUT /api/parts/{id}/ - Update Part**

#### **Request Body** (partial updates allowed)
```json
{
  "quantity": 50,
  "price": "16.99",
  "location": "Shelf A-15"
}
```

### **5. DELETE /api/parts/{id}/ - Delete Part**

#### **Response**
- **Success**: `204 No Content`
- **Not Found**: `404 Not Found`

---

## 🔧 **BUSINESS LOGIC REQUIREMENTS**

### **Stock Management**
1. **Stock Availability**: `stock_quantity` field must be exposed (alias for `quantity`)
2. **Low Stock Alerts**: Support filtering by `low_stock` parameter
3. **Stock Updates**: When parts are used in repair orders, automatically decrement quantity
4. **Minimum Stock**: Track reorder thresholds for inventory management

### **Search Functionality**
1. **Full-text Search**: Search across name, part_number, and description
2. **Category Filtering**: Group parts by categories (Filters, Brakes, Engine, etc.)
3. **Brand Filtering**: Filter by manufacturer/brand
4. **Active Status**: Hide inactive parts from general listings

### **Integration Points**
1. **Repair Orders**: Parts selected during repair order creation
2. **Inventory Reports**: Stock levels and reorder requirements
3. **Pricing**: Support both cost (purchase price) and selling price
4. **Multi-shop**: Parts can be shop-specific or shared

---

## 🏗️ **IMPLEMENTATION GUIDANCE**

### **Django Implementation Example**
```python
# serializers.py
from rest_framework import serializers
from .models import Part

class PartSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.IntegerField(source='quantity', read_only=True)
    
    class Meta:
        model = Part
        fields = [
            'id', 'name', 'part_number', 'description', 'brand', 'category',
            'price', 'cost', 'quantity', 'stock_quantity', 'minimum_stock',
            'location', 'is_active', 'shop', 'created_at', 'updated_at'
        ]

# views.py
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

class PartViewSet(viewsets.ModelViewSet):
    serializer_class = PartSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'part_number', 'description']
    filterset_fields = ['category', 'brand', 'shop', 'is_active']
    
    def get_queryset(self):
        queryset = Part.objects.all()
        
        # Low stock filter
        low_stock = self.request.query_params.get('low_stock')
        if low_stock and low_stock.lower() == 'true':
            queryset = queryset.filter(quantity__lt=models.F('minimum_stock'))
            
        return queryset.order_by('name')

# urls.py
from rest_framework.routers import DefaultRouter
from .views import PartViewSet

router = DefaultRouter()
router.register(r'parts', PartViewSet)
urlpatterns = router.urls
```

### **Database Migrations**
```python
# migration file
from django.db import migrations, models
import uuid

class Migration(migrations.Migration):
    dependencies = [
        ('shop', '0001_initial'),
    ]
    
    operations = [
        migrations.CreateModel(
            name='Part',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('part_number', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('brand', models.CharField(max_length=100)),
                ('category', models.CharField(max_length=100)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('quantity', models.IntegerField(default=0)),
                ('minimum_stock', models.IntegerField(default=0)),
                ('location', models.CharField(blank=True, max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('shop', models.ForeignKey(on_delete=models.deletion.CASCADE, to='shop.shop')),
            ],
            options={
                'ordering': ['name'],
            },
        ),
    ]
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Manual Testing**
```bash
# Test list parts
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/shop/parts/

# Test search
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "http://127.0.0.1:8000/api/shop/parts/?search=oil&category=Filters"

# Test create part
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Part","part_number":"TP-001","brand":"Test","category":"Test","price":"10.00","cost":"5.00","quantity":10,"shop":1}' \
     http://127.0.0.1:8000/api/shop/parts/

# Test low stock filter
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "http://127.0.0.1:8000/api/shop/parts/?low_stock=true"
```

### **Validation Requirements**
- [ ] Authentication required for all endpoints
- [ ] Customer role denied access (403 Forbidden)
- [ ] Part numbers must be unique
- [ ] Price and cost must be positive decimals
- [ ] Quantity and minimum_stock must be non-negative integers
- [ ] Stock_quantity field properly aliased
- [ ] Search functionality working across name/part_number/description
- [ ] Low stock filtering working correctly

---

## 🎯 **FRONTEND INTEGRATION**

### **Current Usage**
The frontend uses this endpoint in:
1. **AddRepairOrderModal**: Loading available parts for repair orders
2. **Parts Management**: CRUD operations for inventory
3. **Stock Filtering**: Only shows parts with `stock_quantity > 0`

### **Expected Integration**
```javascript
// Frontend usage example
const loadParts = async () => {
  try {
    const response = await fetch('/api/shop/parts/?is_active=true', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    const partsInStock = data.results.filter(part => part.stock_quantity > 0);
    setAvailableParts(partsInStock);
  } catch (error) {
    console.error('Failed to load parts:', error);
  }
};
```

---

## 🚨 **CURRENT IMPACT**

### **Blocked Functionality**
- ❌ **AddRepairOrderModal**: Cannot load parts for selection
- ❌ **Parts Management**: No CRUD operations available
- ❌ **Inventory Tracking**: Cannot check stock levels
- ❌ **Repair Order Creation**: Cannot add parts to orders

### **User Experience**
- Modal fails to load with 404 error
- No parts available for repair orders
- Inventory management non-functional
- Business operations severely limited

---

## 📞 **NEXT STEPS FOR BACKEND DEVELOPER**

### **Implementation Priority**
1. **Create Part model** with all required fields
2. **Implement ViewSet** with CRUD operations
3. **Add filtering and search** functionality
4. **Test authentication** and permissions
5. **Verify pagination** and response format
6. **Test with frontend** integration

### **Sample Data for Testing**
```python
# Sample parts data for development
sample_parts = [
    {
        'name': 'Oil Filter',
        'part_number': 'OF-2024-TOYOTA',
        'brand': 'Toyota',
        'category': 'Filters',
        'price': 15.99,
        'cost': 8.50,
        'quantity': 45,
        'minimum_stock': 10,
        'location': 'Shelf A-12'
    },
    {
        'name': 'Brake Pad Set',
        'part_number': 'BP-2024-HONDA',
        'brand': 'Honda',
        'category': 'Brakes',
        'price': 89.99,
        'cost': 45.00,
        'quantity': 15,
        'minimum_stock': 5,
        'location': 'Shelf B-8'
    }
]
```

---

## ✅ **SUCCESS CRITERIA**

The endpoints will be considered complete when:
- [ ] All CRUD operations working
- [ ] Authentication and authorization implemented
- [ ] Search and filtering functional
- [ ] Frontend can load parts successfully
- [ ] Stock quantity field properly exposed
- [ ] Performance acceptable (< 1 second response)
- [ ] Error handling comprehensive

**Priority**: HIGH - This blocks repair order creation and inventory management.

**Estimated Backend Work**: 4-6 hours including model creation, ViewSet implementation, and testing.
