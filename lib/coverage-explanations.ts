// Coverage explanations extracted from RAG knowledge base
// Source: Insurance Information Institute, State Insurance Departments

export interface CoverageExplanation {
  title: string
  description: string
  whatItCovers: string[]
  whatItDoesntCover?: string[]
  keyPoints: string[]
  deductibleInfo?: string
  required?: boolean
}

export const COVERAGE_EXPLANATIONS: Record<string, CoverageExplanation> = {
  'bodily_injury_liability': {
    title: 'Bodily Injury Liability',
    description: 'Covers medical costs, lost wages, pain and suffering for others when you\'re at fault in an accident.',
    whatItCovers: [
      'Medical expenses for injured parties',
      'Lost wages from injuries',
      'Pain and suffering damages',
      'Legal defense costs',
      'Court-awarded damages up to your policy limits'
    ],
    whatItDoesntCover: [
      'Your own injuries (covered by Medical Payments or PIP)',
      'Intentional damage',
      'Damage to your own vehicle'
    ],
    keyPoints: [
      'Split limit format: $X per person / $Y per accident',
      'Recommended minimum: $100,000/$300,000',
      'State Farm recommend: $250,000/$500,000 or more',
      'Protects your assets in lawsuits'
    ],
    required: true
  },
  
  'property_damage_liability': {
    title: 'Property Damage Liability',
    description: 'Pays for damage you cause to other people\'s property when you\'re at fault in an accident.',
    whatItCovers: [
      'Vehicle repair costs for other drivers',
      'Damage to buildings, fences, mailboxes',
      'Damage to personal property in other vehicles',
      'Legal fees if you\'re sued'
    ],
    whatItDoesntCover: [
      'Damage to your own vehicle',
      'Your own property',
      'Intentional damage'
    ],
    keyPoints: [
      'State minimums often too low (e.g., CA: $5,000)',
      'Average vehicle repair costs $4,000-$10,000',
      'Recommended minimum: $50,000-$100,000',
      'Essential in high-cost states like California'
    ],
    required: true
  },
  
  'comprehensive': {
    title: 'Comprehensive Coverage',
    description: 'Protects your vehicle from non-collision damage like theft, vandalism, natural disasters, and animal strikes.',
    whatItCovers: [
      'Theft of your vehicle',
      'Vandalism and malicious mischief',
      'Fire and explosions',
      'Natural disasters (floods, earthquakes, hurricanes)',
      'Falling objects (trees, rocks)',
      'Animal strikes (deer, etc.)',
      'Glass breakage',
      'Civil disturbance or riots'
    ],
    whatItDoesntCover: [
      'Collision with vehicles or objects',
      'Normal wear and tear',
      'Mechanical breakdown',
      'Personal belongings in vehicle'
    ],
    keyPoints: [
      'Subject to your chosen deductible',
      'Required for leased or financed vehicles',
      'Pays actual cash value of vehicle (minus deductible)',
      'Often paired with collision coverage'
    ],
    deductibleInfo: 'You choose your deductible (typically $250-$1,000). Higher deductibles mean lower premiums.'
  },
  
  'collision': {
    title: 'Collision Coverage',
    description: 'Pays for damage to your vehicle from accidents with other vehicles or objects, regardless of who\'s at fault.',
    whatItCovers: [
      'Damage from hitting another vehicle',
      'Single-car accidents (hitting a tree, guardrail, etc.)',
      'Rollovers',
      'Damage when you\'re at fault',
      'Damage when other driver is uninsured'
    ],
    whatItDoesntCover: [
      'Non-collision events (covered by comprehensive)',
      'Normal wear and tear',
      'Mechanical failures',
      'Personal items in vehicle'
    ],
    keyPoints: [
      'Subject to your chosen deductible',
      'Required for leased/financed vehicles',
      'Covers regardless of fault',
      'Pays actual cash value (minus deductible)',
      'Consider dropping on older, low-value vehicles'
    ],
    deductibleInfo: 'Common deductibles: $500, $1,000, $2,000. Higher deductible = lower premium (typically saves 15-30%).'
  },
  
  'uninsured_underinsured_motorist': {
    title: 'Uninsured / Underinsured Motorist Coverage',
    description: 'Protects you when hit by a driver with no insurance or insufficient coverage to pay for your injuries and damages.',
    whatItCovers: [
      'Your medical expenses from uninsured driver accidents',
      'Lost wages',
      'Pain and suffering',
      'Property damage (in some states)',
      'Hit-and-run accidents',
      'Injuries from underinsured drivers'
    ],
    whatItDoesntCover: [
      'Damage you cause to others',
      'Damage to your vehicle (use collision instead)',
      'Intentional acts'
    ],
    keyPoints: [
      '13% of US drivers are uninsured (1 in 8)',
      'Some states like California require it',
      'Typically mirrors your liability limits',
      'Relatively inexpensive ($5-15/month)',
      'Critical protection in high-uninsured states'
    ],
    required: false
  },
  
  'medical_payments': {
    title: 'Medical Payments Coverage (MedPay)',
    description: 'Pays medical expenses for you and your passengers after an accident, regardless of who\'s at fault.',
    whatItCovers: [
      'Medical and hospital bills',
      'Ambulance fees',
      'X-rays and surgery costs',
      'Dental work',
      'Chiropractic care',
      'Funeral expenses'
    ],
    whatItDoesntCover: [
      'Lost wages (use PIP for income replacement)',
      'Long-term care beyond policy limits',
      'Injuries outside your vehicle'
    ],
    keyPoints: [
      'No-deductible coverage',
      'Covers you as driver and all passengers',
      'Works alongside health insurance',
      'Common limits: $1,000-$10,000',
      'Inexpensive supplement to health insurance'
    ],
    deductibleInfo: 'No deductible required. Benefits paid in addition to any health insurance.'
  },
  
  'roadside_assistance': {
    title: 'Roadside Assistance',
    description: 'Provides help when your vehicle breaks down: towing, jump starts, flat tires, lockouts, and fuel delivery.',
    whatItCovers: [
      'Towing to nearest repair facility',
      'Jump starts for dead batteries',
      'Flat tire changes',
      'Lockout service (keys locked in car)',
      'Fuel delivery (if you run out)',
      'Winching/extraction (if stuck)'
    ],
    whatItDoesntCover: [
      'Actual repair costs',
      'Towing beyond included miles',
      'Off-road recovery in remote areas'
    ],
    keyPoints: [
      'Available 24/7 nationwide',
      'Typical cost: $15-30/year',
      'Usually includes 3-5 tows per year',
      'Towing typically up to 15-25 miles',
      'Alternative to AAA membership'
    ],
    required: false
  },
  
  'rental_reimbursement': {
    title: 'Rental Car Reimbursement',
    description: 'Pays for a rental car while your vehicle is being repaired after a covered claim.',
    whatItCovers: [
      'Daily rental car costs during repairs',
      'Transportation after covered collision',
      'Rental after comprehensive claim',
      'Coverage for specified days/amount'
    ],
    whatItDoesntCover: [
      'Rental when vehicle is drivable',
      'Routine maintenance downtime',
      'Mechanical breakdowns (not from accident)',
      'Amounts exceeding policy limits'
    ],
    keyPoints: [
      'Common limits: $30-50/day up to $900-$1,500',
      'Typically 30 days maximum',
      'Relatively inexpensive ($20-50/year)',
      'Useful if you rely on your vehicle daily',
      'Only pays when vehicle is undrivable'
    ],
    required: false
  },
  
  'gap_insurance': {
    title: 'GAP Insurance (Guaranteed Asset Protection)',
    description: 'Covers the difference between what you owe on your vehicle and its actual cash value if it\'s totaled or stolen.',
    whatItCovers: [
      'Loan balance not covered by collision/comprehensive',
      'Negative equity from trade-in',
      'Depreciation gap',
      'Outstanding loan after total loss'
    ],
    whatItDoesntCover: [
      'Your insurance deductible',
      'Overdue loan payments',
      'Extended warranties or other products rolled into loan',
      'Excess mileage or wear charges (for leases)'
    ],
    keyPoints: [
      'Most valuable in first 2-3 years of ownership',
      'Essential for loans with less than 20% down',
      'Important for leased vehicles',
      'Cost: $300-700 at dealer, $20-40/year through insurer',
      'Buy through insurer (much cheaper than dealer)'
    ],
    required: false
  },
  
  'personal_injury_protection': {
    title: 'Personal Injury Protection (PIP)',
    description: 'Covers medical expenses, lost wages, and other costs after an accident, regardless of fault. Required in no-fault states.',
    whatItCovers: [
      'Medical and hospital expenses',
      'Lost wages (typically 80% of income)',
      'Rehabilitation costs',
      'Replacement services (childcare, housekeeping)',
      'Funeral expenses',
      'Covers you, passengers, and pedestrians'
    ],
    whatItDoesntCover: [
      'Pain and suffering',
      'Damage to your vehicle',
      'Injuries while committing a crime'
    ],
    keyPoints: [
      'Required in 12 no-fault states (FL, HI, KS, KY, MI, MN, NJ, NY, ND, PA, UT)',
      'Optional in other states',
      'No-deductible in most states',
      'Common limits: $10,000-$50,000',
      'May coordinate with health insurance'
    ],
    required: false
  },
  
  // ========== RENTERS INSURANCE COVERAGES ==========
  
  'personal_property': {
    title: 'Personal Property Coverage',
    description: 'Covers your belongings (furniture, electronics, clothing, etc.) if they\'re damaged, destroyed, or stolen due to covered perils.',
    whatItCovers: [
      'Furniture and home furnishings',
      'Electronics (TVs, computers, phones)',
      'Clothing and jewelry',
      'Appliances and kitchenware',
      'Sports equipment',
      'Items stolen from your car',
      'Items stolen while traveling',
      'Damage from fire, smoke, lightning',
      'Theft and vandalism',
      'Water damage from burst pipes',
      'Wind and hail damage'
    ],
    whatItDoesntCover: [
      'Flood damage (requires separate flood insurance)',
      'Earthquake damage (requires separate earthquake insurance)',
      'Damage from pests or vermin',
      'Normal wear and tear',
      'Intentional damage',
      'Business property (requires separate policy)'
    ],
    keyPoints: [
      'Typical coverage: $15,000-$50,000',
      'Choose between Replacement Cost Value (RCV) or Actual Cash Value (ACV)',
      'RCV pays to replace items at current prices (recommended)',
      'ACV pays depreciated value (lower premium but less protection)',
      'High-value items may need additional coverage (jewelry, art, collectibles)',
      'Create a home inventory for claims'
    ],
    deductibleInfo: 'Common deductibles: $250, $500, $1,000. Higher deductible = lower premium (typically saves 10-25%).',
    required: false
  },
  
  'renters_liability': {
    title: 'Personal Liability Coverage',
    description: 'Protects you if someone is injured in your rental or you accidentally damage someone else\'s property. Covers legal fees and damages.',
    whatItCovers: [
      'Medical bills for guests injured in your home',
      'Legal defense costs if you\'re sued',
      'Court-awarded damages up to your limit',
      'Damage you cause to others\' property',
      'Injuries caused by your pets (dog bites, etc.)',
      'Accidents you cause away from home',
      'Damage from fire that spreads to other units'
    ],
    whatItDoesntCover: [
      'Intentional damage',
      'Business activities',
      'Professional services',
      'Vehicle-related injuries (use auto insurance)',
      'Injuries to household members'
    ],
    keyPoints: [
      'Standard coverage: $100,000-$500,000',
      'Recommended minimum: $300,000',
      'Consider $500,000 if you have significant assets',
      'Relatively inexpensive to increase limits',
      'Also covers libel, slander, defamation',
      'Essential protection even for renters'
    ],
    required: false
  },
  
  'additional_living_expenses': {
    title: 'Additional Living Expenses (Loss of Use)',
    description: 'Pays for temporary housing and extra costs if your rental becomes uninhabitable due to a covered loss like fire or water damage.',
    whatItCovers: [
      'Hotel or temporary rental costs',
      'Increased food expenses (eating out)',
      'Laundromat costs if no washer/dryer access',
      'Pet boarding fees',
      'Storage unit rental',
      'Moving and transportation costs',
      'Temporary furniture rental'
    ],
    whatItDoesntCover: [
      'Damage from excluded perils',
      'Costs beyond policy limits',
      'Normal living expenses (same as before loss)',
      'Repairs to the rental unit (landlord\'s responsibility)'
    ],
    keyPoints: [
      'Typically 20-30% of personal property coverage',
      'Example: $30K personal property = $6K-9K for living expenses',
      'Covers difference between normal and temporary costs',
      'Time limits typically 12-24 months',
      'No deductible applies',
      'Keep all receipts for reimbursement'
    ],
    required: false
  },
  
  'medical_payments_renters': {
    title: 'Medical Payments to Others',
    description: 'Covers medical expenses for guests injured in your rental, regardless of fault. No lawsuit required.',
    whatItCovers: [
      'Medical bills for injured guests',
      'Hospital and ambulance costs',
      'X-rays and diagnostic tests',
      'Dental treatment',
      'Chiropractic care',
      'Funeral expenses'
    ],
    whatItDoesntCover: [
      'Your own injuries',
      'Injuries to household members',
      'Intentional injuries',
      'Injuries from business activities'
    ],
    keyPoints: [
      'Common limits: $1,000-$5,000',
      'No-fault coverage (pays even if not liable)',
      'No deductible applies',
      'Goodwill gesture to prevent lawsuits',
      'Works alongside liability coverage',
      'Very affordable ($1-5/month)'
    ],
    required: false
  },
  
  'scheduled_personal_property': {
    title: 'Scheduled Personal Property (Floater)',
    description: 'Additional coverage for high-value items like jewelry, art, collectibles, and electronics that exceed standard policy limits.',
    whatItCovers: [
      'Jewelry and watches',
      'Fine art and sculptures',
      'Musical instruments',
      'Collectibles and antiques',
      'Cameras and photography equipment',
      'Furs and designer clothing',
      'Sports equipment (golf clubs, skis)',
      'Silverware and china'
    ],
    whatItDoesntCover: [
      'Items used for business',
      'Damage from neglect',
      'Mysterious disappearance (for some items)',
      'Damage during unprofessional repairs'
    ],
    keyPoints: [
      'Typically required for items over $1,500-$2,500',
      'No deductible for scheduled items',
      'Requires appraisal or proof of value',
      'Covers all-risk perils (broader coverage)',
      'Costs ~1-2% of item value per year',
      'Can be added or removed anytime'
    ],
    deductibleInfo: 'Scheduled items typically have no deductible, unlike standard personal property coverage.',
    required: false
  },
  
  'water_backup': {
    title: 'Water Backup Coverage',
    description: 'Covers damage from sewer or drain backups. Often excluded from standard renters insurance.',
    whatItCovers: [
      'Sewer backup into your unit',
      'Drain overflow or backup',
      'Sump pump failure',
      'Water from floor drains',
      'Damage to your belongings',
      'Cleanup and restoration costs'
    ],
    whatItDoesntCover: [
      'Flood from outside water sources',
      'Maintenance issues (owner responsibility)',
      'Gradual leaks',
      'Damage to the building structure'
    ],
    keyPoints: [
      'Often excluded from standard policies',
      'Common limits: $5,000-$25,000',
      'Relatively inexpensive endorsement ($40-75/year)',
      'Important in older buildings or flood-prone areas',
      'Subject to standard deductible',
      'Highly recommended for basement/ground floor units'
    ],
    required: false
  },
  
  'earthquake_coverage': {
    title: 'Earthquake Coverage',
    description: 'Covers damage from earthquakes and earth movement. Always excluded from standard renters policies.',
    whatItCovers: [
      'Personal property damage from earthquakes',
      'Damage from earth movement or tremors',
      'Aftershock damage',
      'Tsunami damage (in some policies)',
      'Additional living expenses if unit uninhabitable'
    ],
    whatItDoesntCover: [
      'Flood damage',
      'Fire following earthquake (covered by standard policy)',
      'Normal settling or foundation issues',
      'Damage to building structure (landlord\'s coverage)'
    ],
    keyPoints: [
      'Always requires separate policy or endorsement',
      'Essential in high-risk states: CA, WA, OR, AK',
      'Higher deductibles (10-25% of coverage)',
      'Can be expensive in high-risk zones',
      'Government programs available in some states (CEA in CA)',
      'Consider if in earthquake zone'
    ],
    deductibleInfo: 'Earthquake deductibles are typically 10-25% of your personal property coverage, much higher than standard deductibles.',
    required: false
  },
  
  'flood_insurance_renters': {
    title: 'Flood Insurance',
    description: 'Covers damage from flooding. Always excluded from standard renters policies. Available through NFIP or private insurers.',
    whatItCovers: [
      'Personal property from flood damage',
      'Overflow of rivers, streams, or lakes',
      'Storm surge from ocean',
      'Mudflows',
      'Rapid accumulation of runoff water',
      'Collapse of land along shores'
    ],
    whatItDoesntCover: [
      'Damage to building structure (landlord\'s coverage)',
      'Moisture or mold from long-term leaks',
      'Sewer backup (separate coverage)',
      'Currency, precious metals, or securities',
      'Vehicles'
    ],
    keyPoints: [
      'Available through NFIP or private insurers',
      'Required in high-risk flood zones with mortgages',
      'Contents coverage up to $100,000 (NFIP)',
      'Standard 30-day waiting period',
      'Cost varies by flood zone ($200-$1,000/year)',
      'Check FEMA flood maps for your risk'
    ],
    deductibleInfo: 'NFIP deductibles range from $500 to $10,000. Higher deductibles significantly lower premiums.',
    required: false
  },
  
  'identity_theft': {
    title: 'Identity Theft Coverage',
    description: 'Covers costs related to restoring your identity after identity theft. Includes legal fees, lost wages, and restoration expenses.',
    whatItCovers: [
      'Legal fees and attorney costs',
      'Lost wages from time off work',
      'Document replacement costs',
      'Credit monitoring services',
      'Notarization and mailing costs',
      'Loan reapplication fees',
      'Phone calls and fraud affidavits'
    ],
    whatItDoesntCover: [
      'Stolen money or unauthorized charges (credit card protection covers this)',
      'Business identity theft',
      'Fraudulent use of your identity before policy start'
    ],
    keyPoints: [
      'Typical limits: $10,000-$25,000',
      'Very affordable endorsement ($25-50/year)',
      'No deductible on most policies',
      'Includes case management support',
      'Covers expenses, not financial losses',
      'Good supplement to credit monitoring'
    ],
    required: false
  },
  
  // ========== HOMEOWNERS INSURANCE COVERAGES ==========
  
  'dwelling_coverage': {
    title: 'Dwelling Coverage (Coverage A)',
    description: 'Covers the structure of your home and attached structures. Rebuilds or repairs your home if damaged by covered perils like fire, wind, or hail.',
    whatItCovers: [
      'Main structure of your home',
      'Attached structures (garage, deck, porch)',
      'Built-in appliances',
      'Plumbing, electrical, heating systems',
      'Permanently installed fixtures',
      'Walls, roof, foundation',
      'Fire and smoke damage',
      'Wind and hail damage',
      'Lightning strikes',
      'Vandalism and theft damage to structure'
    ],
    whatItDoesntCover: [
      'Flood damage (requires separate flood insurance)',
      'Earthquake damage (requires separate earthquake insurance)',
      'Wear and tear or neglect',
      'Intentional damage',
      'War or nuclear hazard',
      'Detached structures (covered under Coverage B)'
    ],
    keyPoints: [
      'Should cover 100% replacement cost of home',
      'Use replacement cost value, not market value',
      'Typical coverage: $200,000-$500,000+',
      'Extended/guaranteed replacement cost adds 25-50% buffer',
      'Inflation guard increases coverage annually',
      'Most important coverage - get it right!'
    ],
    deductibleInfo: 'Standard deductible applies to dwelling repairs. Common deductibles: $500-$5,000. Wind/hail may have separate percentage deductible (1-5% of dwelling coverage).',
    required: true
  },
  
  'other_structures': {
    title: 'Other Structures (Coverage B)',
    description: 'Covers detached structures on your property like sheds, fences, detached garages, and gazebos.',
    whatItCovers: [
      'Detached garage or carport',
      'Tool sheds and storage buildings',
      'Fences and retaining walls',
      'Gazebos and pergolas',
      'Swimming pools and hot tubs',
      'Driveways and private roads',
      'Guest houses (if not rented)',
      'Mailboxes and lamp posts'
    ],
    whatItDoesntCover: [
      'Structures used for business',
      'Structures rented to non-family members',
      'Land or landscaping',
      'Structures on rented land'
    ],
    keyPoints: [
      'Typically 10% of dwelling coverage',
      'Example: $300K dwelling = $30K for other structures',
      'Can increase if you have expensive outbuildings',
      'Same perils as dwelling coverage',
      'Subject to same deductible',
      'Often overlooked but valuable coverage'
    ],
    required: false
  },
  
  'home_personal_property': {
    title: 'Personal Property (Coverage C)',
    description: 'Covers your belongings inside and outside your home, including furniture, electronics, clothing, and other personal items.',
    whatItCovers: [
      'Furniture and home furnishings',
      'Electronics and appliances',
      'Clothing and jewelry',
      'Books, artwork, collectibles',
      'Sports equipment',
      'Items in storage units',
      'Items in your car',
      'Property stolen while traveling worldwide',
      'Fire, theft, vandalism',
      'Water damage from burst pipes'
    ],
    whatItDoesntCover: [
      'Vehicles and motor vehicles',
      'Animals, birds, fish',
      'Property of roomers or boarders',
      'Business property (limited coverage)',
      'High-value items over sub-limits (need scheduling)'
    ],
    keyPoints: [
      'Typically 50-70% of dwelling coverage',
      'Example: $300K dwelling = $150K-$210K contents',
      'Choose Replacement Cost Value (RCV) over Actual Cash Value',
      'Sub-limits apply: jewelry ($1.5K), cash ($200), electronics ($2.5K)',
      'Schedule high-value items separately',
      'Create detailed home inventory with photos'
    ],
    deductibleInfo: 'Standard deductible applies. Special items coverage (floaters) may have no deductible.',
    required: false
  },
  
  'loss_of_use': {
    title: 'Loss of Use (Coverage D)',
    description: 'Pays for additional living expenses if your home is uninhabitable due to covered damage. Also covers lost rental income for landlords.',
    whatItCovers: [
      'Hotel or temporary rental costs',
      'Restaurant meals (over normal food costs)',
      'Laundry and dry cleaning',
      'Pet boarding',
      'Storage fees',
      'Moving expenses',
      'Increased transportation costs',
      'Temporary furniture rental'
    ],
    whatItDoesntCover: [
      'Normal living expenses (what you\'d pay anyway)',
      'Costs beyond policy time limits',
      'Luxury upgrades',
      'Extended vacations'
    ],
    keyPoints: [
      'Typically 20-30% of dwelling coverage',
      'Example: $300K dwelling = $60K-$90K for living expenses',
      'No deductible applies',
      'Covers difference between normal and temporary costs',
      'Time limits: 12-24 months typically',
      'Keep all receipts for reimbursement',
      'Landlord version: covers lost rental income'
    ],
    required: false
  },
  
  'home_liability': {
    title: 'Personal Liability (Coverage E)',
    description: 'Protects you if someone is injured on your property or you cause damage to someone else\'s property. Covers legal defense and damages.',
    whatItCovers: [
      'Medical bills for injured visitors',
      'Legal defense costs',
      'Court-awarded damages',
      'Property damage you cause',
      'Injuries from your pets',
      'Accidents caused by family members',
      'Incidents away from home',
      'Libel, slander, defamation',
      'False arrest or detention'
    ],
    whatItDoesntCover: [
      'Intentional injuries',
      'Business activities',
      'Professional services',
      'Vehicle-related injuries',
      'Injuries to household members',
      'Property you own or rent'
    ],
    keyPoints: [
      'Standard coverage: $100,000-$500,000',
      'Recommended minimum: $300,000',
      'Consider $500,000+ if significant assets',
      'Umbrella policy adds $1-5M for $200-500/year',
      'Covers defense costs even if claim is frivolous',
      'Essential protection in litigious society'
    ],
    required: true
  },
  
  'medical_payments_home': {
    title: 'Medical Payments to Others (Coverage F)',
    description: 'Covers medical expenses for guests injured on your property, regardless of fault. Prevents small injuries from becoming lawsuits.',
    whatItCovers: [
      'Medical and hospital bills for guests',
      'Ambulance costs',
      'X-rays and diagnostics',
      'Dental treatment',
      'Surgical procedures',
      'Rehabilitation'
    ],
    whatItDoesntCover: [
      'Your own injuries or household members',
      'Intentional injuries',
      'Injuries from business activities',
      'Workers (need workers\' comp)'
    ],
    keyPoints: [
      'Common limits: $1,000-$5,000',
      'No-fault coverage (pays even if not liable)',
      'No deductible',
      'Works alongside liability coverage',
      'Goodwill gesture to prevent lawsuits',
      'Very affordable ($5-20/year to increase)'
    ],
    required: false
  },
  
  'ordinance_or_law': {
    title: 'Ordinance or Law Coverage',
    description: 'Covers costs to bring your home up to current building codes when rebuilding after damage. Critical for older homes.',
    whatItCovers: [
      'Cost to demolish undamaged portions',
      'Removal of debris required by law',
      'Increased costs to meet new building codes',
      'Required upgrades (electrical, plumbing)',
      'ADA compliance requirements',
      'Environmental regulations'
    ],
    whatItDoesntCover: [
      'Upgrades not required by law',
      'Code violations before the loss',
      'Routine maintenance'
    ],
    keyPoints: [
      'Often limited to 10% of dwelling in standard policies',
      'Can add up to 25-50% of dwelling coverage',
      'Critical for homes over 20 years old',
      'Building codes change frequently',
      'Can cost $50,000-$150,000+ for full compliance',
      'Relatively inexpensive endorsement ($50-200/year)',
      'Essential in areas with strict codes'
    ],
    required: false
  },
  
  'service_line_coverage': {
    title: 'Service Line Coverage',
    description: 'Covers repair or replacement of underground utility lines on your property (water, sewer, electrical, gas, data).',
    whatItCovers: [
      'Water supply lines',
      'Sewer and septic lines',
      'Electrical lines',
      'Natural gas lines',
      'Cable/internet lines',
      'Line location and excavation',
      'Repair or replacement',
      'Landscape restoration'
    ],
    whatItDoesntCover: [
      'Lines beyond property boundary',
      'Intentional damage',
      'Wear and tear (debatable)',
      'Lines inside the home'
    ],
    keyPoints: [
      'Common limits: $5,000-$25,000',
      'Average repair cost: $3,000-$10,000',
      'You own lines up to street connection',
      'Tree roots are common cause',
      'Freezing can damage lines',
      'Affordable endorsement ($25-75/year)',
      'Can save thousands in repair costs'
    ],
    required: false
  },
  
  'equipment_breakdown': {
    title: 'Equipment Breakdown Coverage',
    description: 'Covers sudden mechanical or electrical breakdown of home systems and appliances. Extends beyond standard policy coverage.',
    whatItCovers: [
      'HVAC system failures',
      'Water heater breakdowns',
      'Built-in appliances',
      'Electrical panel failures',
      'Well pump failures',
      'Home automation systems',
      'Solar panel systems',
      'Geothermal systems'
    ],
    whatItDoesntCover: [
      'Normal wear and tear',
      'Lack of maintenance',
      'Cosmetic damage',
      'Portable appliances',
      'Items under manufacturer warranty'
    ],
    keyPoints: [
      'Fills gap between homeowners and home warranty',
      'Common limits: $25,000-$100,000',
      'More comprehensive than standard policy',
      'HVAC replacement can cost $5,000-$15,000',
      'Affordable endorsement ($40-100/year)',
      'No deductible on some policies',
      'Consider if home systems are aging'
    ],
    required: false
  },
  
  'home_cyber_protection': {
    title: 'Home Cyber Protection',
    description: 'Covers cyber incidents including identity theft, cyberbullying, online fraud, and data breaches affecting your family.',
    whatItCovers: [
      'Identity theft restoration',
      'Cyber extortion (ransomware)',
      'Online fraud and scams',
      'Cyberbullying and online harassment',
      'Data breach notification costs',
      'Credit monitoring services',
      'Legal fees',
      'Lost wages from time off work'
    ],
    whatItDoesntCover: [
      'Business-related cyber incidents',
      'Intentional hacking by family members',
      'Losses from cryptocurrency',
      'Financial market losses'
    ],
    keyPoints: [
      'Emerging coverage gaining popularity',
      'Typical limits: $10,000-$50,000',
      'Includes family identity theft protection',
      'Covers children\'s online issues',
      'Case management and restoration support',
      'Affordable ($25-100/year)',
      'Essential in digital age'
    ],
    required: false
  },
  
  'home_flood_insurance': {
    title: 'Flood Insurance',
    description: 'Covers flood damage to your home and belongings. Always excluded from standard homeowners policies. Available through NFIP or private insurers.',
    whatItCovers: [
      'Building structure from flood damage',
      'Foundation and structural systems',
      'Electrical and plumbing systems',
      'HVAC equipment',
      'Built-in appliances',
      'Personal property (separate limit)',
      'Overflow from rivers, lakes, ocean',
      'Mudflows and rapid runoff'
    ],
    whatItDoesntCover: [
      'Moisture or mold from long-term seepage',
      'Currency, precious metals',
      'Swimming pools and hot tubs',
      'Landscaping',
      'Basement contents (limited)',
      'Temporary structures'
    ],
    keyPoints: [
      'Available through NFIP or private insurers',
      'Required in high-risk flood zones with mortgages',
      'Building coverage up to $250,000 (NFIP)',
      'Contents coverage up to $100,000 (NFIP)',
      '30-day waiting period',
      'Cost: $500-$5,000/year depending on zone',
      'Even low-risk areas should consider (25% of claims)'
    ],
    deductibleInfo: 'NFIP deductibles: $1,000-$10,000 for building and contents (separate). Private insurers may offer lower deductibles.',
    required: false
  },
  
  'home_earthquake': {
    title: 'Earthquake Insurance',
    description: 'Covers earthquake damage to your home and belongings. Always excluded from standard homeowners policies.',
    whatItCovers: [
      'Dwelling structure damage',
      'Other structures on property',
      'Personal property',
      'Additional living expenses',
      'Aftershock damage',
      'Fire following earthquake (may overlap)',
      'Foundation and structural damage'
    ],
    whatItDoesntCover: [
      'Flood damage (even earthquake-caused)',
      'Landslides not caused by earthquake',
      'Normal settling',
      'Exterior masonry veneer',
      'Landscaping'
    ],
    keyPoints: [
      'Critical in high-risk states: CA, WA, OR, AK, UT',
      'High deductibles (10-25% of dwelling coverage)',
      'Example: $400K home with 15% deductible = $60K out-of-pocket',
      'Expensive in high-risk zones ($800-$5,000/year)',
      'California Earthquake Authority (CEA) offers coverage',
      'Consider if you can\'t afford to rebuild',
      'May need separate policy or endorsement'
    ],
    deductibleInfo: 'Percentage-based deductibles: 10-25% of dwelling coverage. Some policies offer 5% with higher premium. Much higher than standard deductibles.',
    required: false
  },
  
  'sinkhole_coverage': {
    title: 'Sinkhole Coverage',
    description: 'Covers damage from sinkholes and catastrophic ground collapse. Important in areas with limestone bedrock, especially Florida.',
    whatItCovers: [
      'Structural damage from sinkhole activity',
      'Foundation settling and cracks',
      'Catastrophic ground collapse',
      'Engineering and geological testing',
      'Sinkhole stabilization',
      'Home demolition if necessary'
    ],
    whatItDoesntCover: [
      'Normal settling',
      'Minor foundation cracks',
      'Damage from mining or excavation',
      'Pre-existing conditions'
    ],
    keyPoints: [
      'Critical in Florida (required by law as option)',
      'Also important in: TX, AL, MO, KY, TN, PA',
      'Catastrophic ground collapse usually covered in standard policies',
      'Full sinkhole coverage requires endorsement',
      'Can be expensive ($1,500-$3,000/year in FL)',
      'Inspections may be required',
      'High deductible (often 10%)'
    ],
    required: false
  },
  
  // ========== LIFE INSURANCE COVERAGES ==========
  
  'term_life_insurance': {
    title: 'Term Life Insurance',
    description: 'Provides coverage for a specific period (10, 20, 30 years). Pays death benefit if you die during the term. No cash value. Most affordable life insurance.',
    whatItCovers: [
      'Death benefit paid to beneficiaries',
      'Accidental death',
      'Death from illness',
      'Death from natural causes',
      'Coverage for entire term period',
      'Level premiums (most policies)',
      'Conversion option to permanent (usually included)'
    ],
    whatItDoesntCover: [
      'Death after term expires (unless renewed)',
      'Living benefits (no cash value)',
      'Suicide within first 2 years (contestability period)',
      'Death from excluded activities (skydiving, racing, etc.)',
      'Material misrepresentation on application'
    ],
    keyPoints: [
      'Most affordable option (5-10x cheaper than whole life)',
      'Recommended for: mortgages, income replacement, child-rearing years',
      'Example: $500K, 20-year term = $30-50/month (healthy 35-year-old)',
      'Can convert to permanent without medical exam (typically)',
      'Renewable but premiums increase significantly at term end',
      'Best for temporary needs (mortgage protection, young children)',
      'Level term = premiums stay same for entire term'
    ],
    required: false
  },
  
  'whole_life_insurance': {
    title: 'Whole Life Insurance',
    description: 'Permanent life insurance with guaranteed death benefit, fixed premiums, and cash value growth. Covers you for entire life.',
    whatItCovers: [
      'Guaranteed death benefit (entire life)',
      'Cash value accumulation',
      'Guaranteed cash value growth',
      'Dividend payments (participating policies)',
      'Living benefits through cash value access',
      'Loan option against cash value',
      'Paid-up additions option'
    ],
    whatItDoesntCover: [
      'Investment returns beyond guaranteed minimum',
      'Suicide within first 2 years',
      'Outstanding policy loans (deducted from death benefit)',
      'Material misrepresentation'
    ],
    keyPoints: [
      'Fixed premiums never increase',
      'Builds cash value (tax-deferred growth)',
      'Can borrow against cash value (4-8% interest)',
      'Dividends can reduce premiums or increase death benefit',
      'Expensive: $500K = $400-600/month (35-year-old)',
      'Good for: estate planning, lifelong dependents, wealth transfer',
      'Cash value growth is slow initially (10-15 years)',
      'Guaranteed minimum growth rate (typically 2-4%)'
    ],
    required: false
  },
  
  'universal_life_insurance': {
    title: 'Universal Life Insurance',
    description: 'Flexible permanent life insurance. Adjust premiums and death benefit. Cash value growth tied to interest rates. More flexibility than whole life.',
    whatItCovers: [
      'Death benefit (can be adjustable)',
      'Cash value accumulation',
      'Interest-based growth',
      'Flexible premium payments',
      'Partial withdrawals from cash value',
      'Policy loans',
      'Skip premium payments (if cash value sufficient)'
    ],
    whatItDoesntCover: [
      'Guaranteed growth (rates fluctuate)',
      'Policy lapse if insufficient cash value',
      'Excessive withdrawals depleting policy'
    ],
    keyPoints: [
      'Flexible premiums (pay more or less as needed)',
      'Can increase or decrease death benefit',
      'Cash value earns interest based on current rates',
      'Interest rates: 2-6% typically',
      'Moderate cost: less than whole life, more than term',
      'Good for: changing needs, variable income',
      'Requires monitoring - can lapse if underfunded',
      'Indexed universal life (IUL) ties growth to stock index'
    ],
    required: false
  },
  
  'variable_life_insurance': {
    title: 'Variable Life Insurance',
    description: 'Permanent life insurance with cash value invested in sub-accounts (similar to mutual funds). Higher growth potential but also higher risk.',
    whatItCovers: [
      'Death benefit (with potential increases)',
      'Cash value in investment sub-accounts',
      'Multiple investment options (stocks, bonds, money market)',
      'Potential for higher returns',
      'Policy loans',
      'Partial withdrawals'
    ],
    whatItDoesntCover: [
      'Guaranteed cash value (market-dependent)',
      'Guaranteed death benefit above minimum',
      'Investment losses (you bear the risk)'
    ],
    keyPoints: [
      'Investment risk and reward go to policyholder',
      'Cash value can grow substantially or lose value',
      'Death benefit can increase with strong performance',
      'Requires securities license to sell',
      'More expensive than term (similar to whole life)',
      'Good for: sophisticated investors, high risk tolerance',
      'Variable universal life (VUL) adds premium flexibility',
      'Management fees reduce returns (1-3% annually)'
    ],
    required: false
  },
  
  'guaranteed_issue_life': {
    title: 'Guaranteed Issue Life Insurance',
    description: 'No medical exam or health questions required. Guaranteed approval. Higher premiums and lower death benefits. Good for those with serious health issues.',
    whatItCovers: [
      'Guaranteed death benefit (after waiting period)',
      'Accidental death from day one',
      'Full death benefit after 2-3 years',
      'Return of premiums if die during waiting period',
      'Coverage regardless of health status'
    ],
    whatItDoesntCover: [
      'Full death benefit in first 2-3 years (graded benefit)',
      'High coverage amounts (typically $25K max)',
      'Suicide within first 2 years'
    ],
    keyPoints: [
      'No medical exam or health questions',
      'Approval guaranteed (age limits apply)',
      'Expensive: 2-3x more than traditional policies',
      'Graded death benefit: full payout after 2-3 years',
      'During waiting period: return of premiums + interest',
      'Typical coverage: $5,000-$25,000',
      'Good for: serious health issues, final expenses',
      'Age limits: typically 50-85 years old'
    ],
    required: false
  },
  
  'accidental_death_dismemberment': {
    title: 'Accidental Death & Dismemberment (AD&D)',
    description: 'Pays benefit if you die or lose limbs/sight in an accident. Supplement to regular life insurance, not a replacement.',
    whatItCovers: [
      'Death from accident (full benefit)',
      'Loss of limbs (partial benefit)',
      'Loss of sight (partial benefit)',
      'Loss of hearing or speech (partial benefit)',
      'Paralysis (partial benefit)',
      'Accident-related death only'
    ],
    whatItDoesntCover: [
      'Death from illness or natural causes',
      'Death from drug or alcohol use',
      'Self-inflicted injuries',
      'War or acts of terrorism',
      'Dangerous activities (skydiving, racing)',
      'Pre-existing conditions leading to accident'
    ],
    keyPoints: [
      'Very affordable ($5-20/month for $250K)',
      'Only pays for accidental death (3-5% of all deaths)',
      'Schedule of benefits: 50% for one limb, 100% for two',
      'Often included with employer benefits',
      'NOT a replacement for life insurance',
      'Good as: supplemental coverage only',
      'Common exclusions significantly limit coverage',
      'Better to increase term life coverage instead'
    ],
    required: false
  },
  
  'final_expense_insurance': {
    title: 'Final Expense Insurance',
    description: 'Small whole life policy ($5K-$50K) designed to cover funeral, burial, and end-of-life costs. Easier underwriting than traditional life insurance.',
    whatItCovers: [
      'Funeral and burial costs',
      'Cremation expenses',
      'Memorial service costs',
      'Outstanding medical bills',
      'Credit card debt',
      'Small estate debts',
      'Administrative expenses'
    ],
    whatItDoesntCover: [
      'Large debts or mortgages (coverage too small)',
      'Income replacement (insufficient amount)'
    ],
    keyPoints: [
      'Coverage amounts: $5,000-$50,000',
      'Whole life policy (permanent coverage)',
      'Simplified underwriting (fewer health questions)',
      'Average funeral cost: $7,000-$12,000',
      'Fixed premiums that never increase',
      'Builds small cash value',
      'Good for: seniors, final expenses, no dependents',
      'More expensive per $1,000 than term life'
    ],
    required: false
  },
  
  'return_of_premium_term': {
    title: 'Return of Premium (ROP) Term Life',
    description: 'Term life insurance that returns all premiums paid if you outlive the term. More expensive than regular term but you get money back.',
    whatItCovers: [
      'Death benefit if you die during term',
      'Return of all premiums if you survive term',
      'Coverage for entire term period',
      'Partial returns for early cancellation (some policies)'
    ],
    whatItDoesntCover: [
      'Interest or investment returns on premiums',
      'Death after term expires',
      'Full refund if cancel early (typically partial only)'
    ],
    keyPoints: [
      '30-50% more expensive than regular term',
      'Break-even at end of term if you survive',
      'Example: $500K, 20-year ROP = $90-120/month vs $30-50 regular',
      'Good for: guaranteed return, forced savings',
      'Returns are tax-free',
      'Better alternatives: invest the difference yourself',
      'Early cancellation penalties apply',
      'Long commitment (20-30 years) required'
    ],
    required: false
  },
  
  // ========== DISABILITY INSURANCE COVERAGES ==========
  
  'short_term_disability': {
    title: 'Short-Term Disability Insurance',
    description: 'Replaces portion of income if unable to work due to illness or injury. Typically covers 3-6 months. Often provided by employers.',
    whatItCovers: [
      'Illness preventing work',
      'Non-work injuries',
      'Surgery recovery',
      'Pregnancy and childbirth',
      'Mental health conditions (limited)',
      'Typically 60-70% of income',
      'Benefit period: 3-6 months'
    ],
    whatItDoesntCover: [
      'Pre-existing conditions (waiting period)',
      'Self-inflicted injuries',
      'Injuries from criminal activity',
      'Disabilities covered by workers\' comp',
      'Beyond maximum benefit period',
      '100% of income (always partial replacement)'
    ],
    keyPoints: [
      'Elimination period: 0-14 days (waiting period)',
      'Replaces 60-70% of income',
      'Maximum benefit period: 13-26 weeks',
      'Often employer-provided benefit',
      'Individual policies: $20-80/month',
      'Bridge to long-term disability',
      'Taxable if employer-paid, tax-free if you pay',
      'Can use sick leave during elimination period'
    ],
    required: false
  },
  
  'long_term_disability': {
    title: 'Long-Term Disability Insurance',
    description: 'Replaces portion of income if unable to work long-term due to illness or injury. Critical protection for working-age individuals.',
    whatItCovers: [
      'Long-term illness',
      'Serious injuries',
      'Chronic conditions',
      'Mental health conditions (2-year limit typical)',
      'Cancer treatment',
      'Heart attack, stroke recovery',
      'Back injuries, arthritis',
      'Typically 50-70% of income',
      'Benefit period: 2 years to age 65-67'
    ],
    whatItDoesntCover: [
      'Pre-existing conditions (90-180 day exclusion)',
      'Self-inflicted injuries',
      'War or acts of war',
      'Incarceration',
      'Normal pregnancy (short-term covers this)',
      'Beyond policy maximum age (typically 65-67)'
    ],
    keyPoints: [
      'Elimination period: 90-180 days (most common)',
      'Replaces 50-70% of income (max $5K-15K/month)',
      'Own occupation vs any occupation (critical distinction)',
      'Group policies: 1-3% of salary',
      'Individual policies: 2-6% of benefit amount',
      'Tax-free benefits if you pay premiums',
      'Essential coverage - 1 in 4 workers become disabled',
      'Cost of living adjustments available (COLA rider)'
    ],
    required: false
  },
  
  'own_occupation_disability': {
    title: 'Own Occupation Disability Coverage',
    description: 'Most comprehensive disability coverage. Pays benefits if you cannot perform your specific occupation, even if you work in another field.',
    whatItCovers: [
      'Inability to perform your specific occupation',
      'Can work in different occupation and still receive benefits',
      'Partial disability benefits',
      'Residual benefits if earning less',
      'Specialty-specific definitions (surgeons, dentists, etc.)'
    ],
    whatItDoesntCover: [
      'Ability to work in your own occupation (if recovered)',
      'Pre-existing conditions during exclusion period'
    ],
    keyPoints: [
      'Most expensive disability coverage',
      'Best protection for high-income professionals',
      'Example: surgeon unable to operate can receive benefits even if teaching',
      'True own occupation: pays even if working elsewhere',
      'Modified own occupation: pays if not working elsewhere',
      'Critical for: doctors, dentists, lawyers, executives',
      'Premiums: 3-6% of benefit amount',
      'Worth the extra cost for specialized professionals'
    ],
    required: false
  },
  
  'any_occupation_disability': {
    title: 'Any Occupation Disability Coverage',
    description: 'Pays benefits only if you cannot work in ANY occupation suited to your education and experience. More restrictive but less expensive.',
    whatItCovers: [
      'Total inability to work in any gainful occupation',
      'Disability so severe you cannot work at all',
      'Benefits if cannot do any job you\'re qualified for'
    ],
    whatItDoesntCover: [
      'Partial disability (typically)',
      'Ability to work in any occupation (even if different)',
      'Inability to work in your specific profession only'
    ],
    keyPoints: [
      'Harder to qualify for benefits',
      'Less expensive than own occupation (30-50% cheaper)',
      'Common in group employer plans',
      'May require you to retrain for new career',
      'Not recommended for high-income earners',
      'Better than no coverage, but significant limitations',
      'Example: teacher unable to teach must try office work',
      'Social Security Disability has similar definition'
    ],
    required: false
  },
  
  'partial_disability': {
    title: 'Partial Disability Coverage',
    description: 'Pays reduced benefits if you can work part-time or in a reduced capacity. Bridges gap between full disability and full recovery.',
    whatItCovers: [
      'Ability to work part-time only',
      'Reduced work hours',
      'Lower-paying work due to disability',
      'Transitional return to work',
      'Typically 50% of full disability benefit',
      'Requires prior total disability (usually)'
    ],
    whatItDoesntCover: [
      'Full earnings capacity',
      'Elective part-time work',
      'Voluntary income reduction'
    ],
    keyPoints: [
      'Encourages return to work',
      'Typically pays 50% of total disability benefit',
      'Usually requires 6 months total disability first',
      'Benefit period: 3-6 months typically',
      'May require 20%+ income loss',
      'Often included in base policy',
      'Helps with gradual return to work',
      'Supplements partial income'
    ],
    required: false
  },
  
  'residual_disability': {
    title: 'Residual Disability Coverage',
    description: 'Pays proportionate benefits based on income loss. If earning 60% of pre-disability income, receive 40% of benefit. More flexible than partial disability.',
    whatItCovers: [
      'Proportionate income loss',
      'Any percentage of income reduction',
      'Working full-time but earning less',
      'Working part-time',
      'No requirement of prior total disability',
      'Benefits based on income loss formula'
    ],
    whatItDoesntCover: [
      'Income loss below policy threshold (typically 20%)',
      'Voluntary income reduction',
      'Economic factors unrelated to disability'
    ],
    keyPoints: [
      'More valuable than partial disability',
      'Formula: (Pre-disability income - Current income) / Pre-disability income × Benefit',
      'Example: Earned $10K/month, now earn $4K = 60% benefit',
      'No prior total disability required (usually)',
      'Threshold: typically 20% income loss minimum',
      'Important for: commission workers, business owners',
      'Add as rider or included in policy',
      'Cost: adds 10-20% to premium'
    ],
    required: false
  },
  
  'disability_cola_rider': {
    title: 'Cost of Living Adjustment (COLA) Rider',
    description: 'Increases disability benefits annually based on inflation. Protects purchasing power during long-term disability.',
    whatItCovers: [
      'Annual benefit increases',
      'Inflation protection',
      'Compound or simple increases',
      'Tied to CPI or fixed percentage',
      'Applies after benefit payments begin'
    ],
    whatItDoesntCover: [
      'Increases before disability occurs',
      'Decreases in benefits (only increases)',
      'Negative inflation adjustments'
    ],
    keyPoints: [
      'Critical for long-term disabilities',
      'Typical adjustments: 3% simple or compound',
      'CPI-linked options available',
      'Example: $5K/month benefit becomes $6,500 in 10 years (3% compound)',
      'Adds 15-25% to premium',
      'Essential if disabled young (age 30-40)',
      'Can cap at certain percentage (e.g., max 100% increase)',
      'Worth the cost for extended protection'
    ],
    required: false
  },
  
  'future_increase_option': {
    title: 'Future Increase Option (FIO) Rider',
    description: 'Allows you to increase coverage as income grows without medical underwriting. Lock in insurability.',
    whatItCovers: [
      'Periodic benefit increases',
      'No medical exam required for increases',
      'Protect against future health issues',
      'Option dates: every 2-3 years',
      'Increases tied to income growth'
    ],
    whatItDoesntCover: [
      'Unlimited increases (caps apply)',
      'Increases beyond income justification',
      'Free increases (pay additional premium)'
    ],
    keyPoints: [
      'Critical for young professionals (income growing)',
      'Exercise option every 2-3 years',
      'No medical exam needed (guaranteed standard rates)',
      'Must show income to justify increase',
      'Typical cap: double initial benefit',
      'Adds 10-15% to initial premium',
      'Expires at age 50-55 typically',
      'Essential if bought coverage young'
    ],
    required: false
  }
}

// Helper function to get explanation by coverage type
export function getCoverageExplanation(coverageType: string): CoverageExplanation | null {
  const normalized = coverageType
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/_coverage$/, '')
    .replace(/_insurance$/, '')
  
  return COVERAGE_EXPLANATIONS[normalized] || null
}

// Helper to format coverage key for lookup
export function normalizeCoverageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/_coverage$/, '')
    .replace(/_insurance$/, '')
}

