# Question-Prompt Alignment Test Checklist

## ✅ Basic Information

### 1. Number of Drivers
- **Question:** "How many drivers will be on the policy?"
- **Expected Prompts:**
  - Just me
  - 2 drivers  
  - 3 drivers
  - 4 or more drivers
- **Status:** ✅ Aligned

### 2. Number of Vehicles  
- **Question:** "How many vehicles need coverage?"
- **Expected Prompts:**
  - Just 1 vehicle
  - 2 vehicles
  - 3 vehicles
  - 4 or more vehicles
- **Status:** ✅ Aligned

### 3. ZIP Code
- **Question:** "What ZIP code will the vehicles be garaged in?"
- **Expected Prompts:**
  - 94105
  - Use my location
  - I'll enter it manually
  - Why do you need ZIP code?
- **Status:** ✅ Aligned

## ✅ Driver Information

### 4. Driver Age
- **Question:** "How old is driver X?"
- **Expected Prompts:**
  - 18
  - 25
  - 35
  - 45
- **Status:** ✅ Aligned (Note: Automatically uses customer profile age for single drivers)

### 5. Years Licensed  
- **Question:** "How many years has driver X been licensed?"
- **Expected Prompts:**
  - Less than 1 year
  - 3 years
  - 5 years
  - 10+ years
- **Status:** ✅ Aligned (Fixed underscore matching issue)

### 6. Marital Status
- **Question:** "What is driver X's marital status?"
- **Expected Prompts:**
  - Single
  - Married
  - Divorced
  - Widowed
- **Status:** ✅ Aligned

### 7. Driving Record
- **Question:** "Does driver X have a clean driving record?"
- **Expected Prompts:**
  - Yes, clean record
  - 1 speeding ticket
  - 1 accident
  - Multiple violations
- **Status:** ✅ Aligned

## ✅ Vehicle Information

### 8. Vehicle Year
- **Question:** "What year is vehicle X?"
- **Expected Prompts:**
  - 2024
  - 2022
  - 2020
  - 2018
- **Status:** ✅ Aligned (Fixed to show years instead of ages)

### 9. Vehicle Make
- **Question:** "What make is vehicle X?"
- **Expected Prompts:**
  - Toyota
  - Honda
  - Ford
  - Chevrolet
- **Status:** ✅ Aligned

### 10. Vehicle Model
- **Question:** "What model is vehicle X?"
- **Expected Prompts (Dynamic based on make):**
  - **Toyota:** Camry, Corolla, RAV4, Highlander
  - **Honda:** Accord, Civic, CR-V, Pilot
  - **Ford:** F-150, Explorer, Escape, Mustang
  - **Chevrolet:** Silverado, Malibu, Equinox, Tahoe
  - **Tesla:** Model 3, Model Y, Model S, Model X
  - **Other:** Sedan, SUV, Truck, I'll type the model
- **Status:** ✅ Aligned (Now dynamically matches selected make)

### 11. Annual Mileage
- **Question:** "How many miles per year for vehicle X?"
- **Expected Prompts:**
  - Under 5,000 miles
  - About 10,000 miles
  - About 12,000 miles
  - Over 15,000 miles
- **Status:** ✅ Aligned

### 12. Primary Use
- **Question:** "Is vehicle X for commuting, pleasure, or business?"
- **Expected Prompts:**
  - Commuting
  - Pleasure
  - Business
  - Both commute and pleasure
- **Status:** ✅ Aligned

## ✅ Coverage Preferences

### 13. Coverage Level
- **Question:** "What level of coverage are you looking for?"
- **Expected Prompts:**
  - State minimum only
  - Standard coverage
  - Full coverage
  - What do you recommend?
- **Status:** ✅ Aligned

### 14. Deductible
- **Question:** "What deductible amount would you prefer?"
- **Expected Prompts:**
  - $250 deductible
  - $500 deductible
  - $1000 deductible
  - $1500+ deductible
- **Status:** ✅ Aligned

## Key Fixes Applied

1. **Underscore Matching:** Fixed all conditions to properly match underscore patterns (e.g., `driver_1_experience`)
2. **Vehicle Year vs Driver Age:** Separated prompt logic to show years for vehicles and ages for drivers
3. **Dynamic Model Options:** Model prompts now adapt based on selected vehicle make
4. **Customer Profile Integration:** Single driver automatically uses customer's age from profile
5. **Section-by-Section Collection:** System asks driver info first, then vehicles, then coverage

## Testing Instructions

1. Start a new conversation with "Just me" for drivers
2. Verify system skips driver age (uses profile age 23)
3. Enter "1 vehicle" 
4. Check ZIP code prompts
5. Verify vehicle year shows 2024/2022/2020/2018 (not ages)
6. Select a make (e.g., Toyota)
7. Verify model options match the selected make
8. Continue through remaining questions
9. Confirm each prompt set matches its question

All alignments have been verified and corrected ✅