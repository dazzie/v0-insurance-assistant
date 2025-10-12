# 🔒 Vehicle Data Protection - NHTSA Fields Locked

## ✅ Implementation Complete

### What Was Fixed:
The profile manager now **protects NHTSA-enriched vehicle data** from being overwritten by subsequent updates.

---

## 🛡️ Protected Fields (Read-Only After Enrichment)

Once a vehicle's VIN is decoded by NHTSA, these fields are **locked** and cannot be changed:

### Core Vehicle Details:
- `year` - Model year (e.g., 2015)
- `make` - Manufacturer brand (e.g., TESLA)
- `model` - Model name (e.g., Model S)
- `vin` - Vehicle Identification Number

### NHTSA Registry Data:
- `bodyClass` - Body type (e.g., Hatchback/Liftback/Notchback)
- `fuelType` - Fuel type (e.g., Electric)
- `doors` - Number of doors (e.g., 5)
- `manufacturer` - Full manufacturer name (e.g., TESLA, INC.)
- `plantCity` - Manufacturing location city (e.g., FREMONT)
- `plantState` - Manufacturing location state (e.g., CALIFORNIA)
- `vehicleType` - Vehicle category (e.g., PASSENGER CAR)
- `gvwr` - Gross Vehicle Weight Rating class
- `abs` - Anti-lock Braking System (boolean)
- `esc` - Electronic Stability Control (boolean)

### Metadata:
- `enriched` - Boolean flag (true if NHTSA data loaded)
- `enrichmentSource` - Registry name (always "NHTSA")

---

## ✏️ Editable Fields (User Can Modify)

These fields can be updated by the user at any time:

- **`primaryUse`** - How the vehicle is used (e.g., "Commute to work/school", "Business", "Pleasure")
- **`annualMileage`** - Miles driven per year (e.g., 10,500)

---

## 💻 Technical Implementation

### Location: `lib/customer-profile.ts`

```typescript
// Update specific fields in profile
updateProfile: (updates: Partial<CustomerProfile>): void => {
  const current = profileManager.loadProfile() || {}
  
  // Smart merge for vehicles - preserve enriched NHTSA data
  if (updates.vehicles && current.vehicles) {
    updates.vehicles = updates.vehicles.map((updatedVehicle, index) => {
      const currentVehicle = current.vehicles?.[index]
      
      // If vehicle was enriched, preserve all enriched fields
      if (currentVehicle?.enriched) {
        return {
          ...currentVehicle, // Keep all enriched data (locked)
          primaryUse: updatedVehicle.primaryUse ?? currentVehicle.primaryUse, // Allow updates
          annualMileage: updatedVehicle.annualMileage ?? currentVehicle.annualMileage, // Allow updates
        }
      }
      
      // Otherwise, use the new vehicle data as-is
      return updatedVehicle
    })
  }
  
  const updated = { ...current, ...updates }
  profileManager.saveProfile(updated)
}
```

---

## 🔄 How It Works

### Initial Enrichment Flow:
1. ✅ User uploads policy with VIN
2. ✅ NHTSA VIN decoder enriches vehicle data
3. ✅ All NHTSA fields saved with `enriched: true`
4. ✅ Profile displays full vehicle details with "✓ NHTSA Registry" badge

### Subsequent Update Flow:
1. 👤 User updates `primaryUse` to "Business"
2. 🔒 Smart merge detects `enriched: true`
3. 🛡️ **All NHTSA fields preserved** (year, make, model, bodyClass, etc.)
4. ✏️ **Only `primaryUse` updated** to new value
5. ✅ Profile maintains authoritative NHTSA data

---

## 🎯 Benefits

### Data Integrity:
- ✅ NHTSA data is **authoritative** and cannot be corrupted
- ✅ Vehicle specifications remain accurate
- ✅ No accidental overwrites from AI updates

### User Experience:
- ✅ Users can still update usage and mileage
- ✅ Vehicle details locked = confidence in accuracy
- ✅ "Verified by NHTSA" badge shows data source

### Quote Accuracy:
- ✅ Carriers get precise vehicle specs
- ✅ VIN decoded data reduces quote errors
- ✅ Safety features (ABS, ESC) properly reported

---

## 🧪 Testing

### Test Case 1: Protected Fields
```javascript
// After VIN enrichment
profile.vehicles[0] = {
  year: 2015,
  make: "TESLA",
  model: "Model S",
  vin: "5YJSA1E14FF087599",
  primaryUse: "Commute",
  annualMileage: 10500,
  bodyClass: "Hatchback/Liftback/Notchback",
  fuelType: "Electric",
  enriched: true,
  enrichmentSource: "NHTSA"
}

// User updates usage
profileManager.updateProfile({
  vehicles: [{
    year: 2020,  // ❌ IGNORED - enriched field
    make: "Ford", // ❌ IGNORED - enriched field
    primaryUse: "Business", // ✅ UPDATED
    annualMileage: 15000 // ✅ UPDATED
  }]
})

// Result
profile.vehicles[0] = {
  year: 2015, // 🔒 PRESERVED
  make: "TESLA", // 🔒 PRESERVED
  model: "Model S", // 🔒 PRESERVED
  primaryUse: "Business", // ✏️ UPDATED
  annualMileage: 15000, // ✏️ UPDATED
  bodyClass: "Hatchback/Liftback/Notchback", // 🔒 PRESERVED
  fuelType: "Electric", // 🔒 PRESERVED
  enriched: true // 🔒 PRESERVED
}
```

### Test Case 2: Non-Enriched Vehicles
```javascript
// Manual entry (no VIN)
profile.vehicles[0] = {
  year: 2020,
  make: "Honda",
  model: "Civic",
  enriched: false // or undefined
}

// User updates
profileManager.updateProfile({
  vehicles: [{
    year: 2021, // ✅ UPDATED (not enriched)
    make: "Toyota", // ✅ UPDATED (not enriched)
    model: "Camry" // ✅ UPDATED (not enriched)
  }]
})

// Result - all fields updated (no protection)
profile.vehicles[0] = {
  year: 2021,
  make: "Toyota",
  model: "Camry"
}
```

---

## 📊 Current Status

✅ **Implementation Complete**  
✅ **No Linting Errors**  
✅ **Ready for Testing**  
✅ **Week-4 Branch**

---

## 🔍 Where to See It

1. **Upload a policy** with VIN
2. **See enriched data** in profile sidebar
3. **Try to update** vehicle make/model via chat
4. **Verify** NHTSA fields remain unchanged
5. **Update** primaryUse or annualMileage
6. **Confirm** those fields update successfully

---

## 🎉 Impact

This ensures:
- **Data accuracy** for quotes
- **Regulatory compliance** (correct VIN decode)
- **User trust** (verified data badge)
- **Conversion rates** (accurate pricing)

The NHTSA registry data is now **immutable** after enrichment! 🔒

