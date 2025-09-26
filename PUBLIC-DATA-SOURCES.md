# Public Insurance Data Sources for RAG

## 🏛️ Government & Regulatory Sources

### State Insurance Departments
Each state has official insurance regulations and consumer guides:

| State | Resource | Data Available |
|-------|----------|----------------|
| **NAIC** | [naic.org/state-insurance-departments](https://content.naic.org/state-insurance-departments) | All 50 states directory, regulations, minimum requirements |
| **California** | [insurance.ca.gov](https://www.insurance.ca.gov) | CA regulations, rate filings, consumer guides, complaint data |
| **Texas** | [tdi.texas.gov](https://www.tdi.texas.gov) | TX minimums, carrier licenses, rate comparisons |
| **New York** | [dfs.ny.gov](https://www.dfs.ny.gov) | NY requirements, approved carriers, consumer resources |
| **Florida** | [floir.com](https://www.floir.com) | FL regulations, hurricane guides, rate comparisons |

**Key Data to Extract:**
- Minimum coverage requirements by state
- State-specific regulations and laws
- Consumer complaint ratios
- Licensed carrier lists
- Rate filing data

### Federal Resources
| Source | URL | Data Type |
|--------|-----|-----------|
| **NHTSA** | [nhtsa.gov/ratings](https://www.nhtsa.gov/ratings) | Vehicle safety ratings, crash test data |
| **IIHS** | [iihs.org/ratings](https://www.iihs.org/ratings) | Vehicle safety, theft rates, claim frequencies |
| **Census Bureau** | [census.gov](https://www.census.gov) | Demographics, income data by ZIP |
| **NOAA** | [noaa.gov](https://www.noaa.gov) | Weather risks, catastrophe data |
| **FBI Crime Data** | [ucr.fbi.gov](https://ucr.fbi.gov) | Crime statistics by area |

## 📊 Insurance Industry Sources

### Insurance Information Institute (III)
**URL:** [iii.org](https://www.iii.org)

**Available Data:**
- Insurance facts and statistics
- State insurance profiles
- Coverage explanations and guides
- Industry trends and research
- Disaster and catastrophe data

**API Access:** Some data available via API

### J.D. Power
**URL:** [jdpower.com/insurance](https://www.jdpower.com/business/insurance)

**Available Data:**
- Customer satisfaction ratings
- Claims satisfaction studies
- Shopping behavior research
- Regional study results

### AM Best
**URL:** [ambest.com](https://www.ambest.com)

**Available Data:**
- Financial strength ratings
- Carrier creditworthiness
- Industry reports
- Market share data

## 🚗 Auto Insurance Specific

### Kelley Blue Book
**URL:** [kbb.com/api](https://www.kbb.com)

**Available Data:**
- Vehicle values
- Make/model information
- Depreciation data
- Total cost of ownership

**API:** Commercial API available

### Edmunds
**URL:** [edmunds.com/api](https://www.edmunds.com)

**Available Data:**
- Vehicle specs and features
- True Cost to Own®
- Safety ratings
- Maintenance costs

### Carfax
**URL:** [carfax.com](https://www.carfax.com)

**Available Data:**
- Vehicle history impact on rates
- Accident statistics
- Maintenance importance data

## 🏠 Home Insurance Sources

### Zillow
**URL:** [zillow.com/research/data](https://www.zillow.com/research/data/)

**Available Data:**
- Home values by ZIP (ZHVI)
- Property details
- Neighborhood data
- Market trends

**API:** Zillow API available

### Redfin
**URL:** [redfin.com/news/data-center](https://www.redfin.com/news/data-center/)

**Available Data:**
- Housing market data
- Property values
- Market competition scores

### FEMA Flood Maps
**URL:** [msc.fema.gov](https://msc.fema.gov)

**Available Data:**
- Flood zone designations
- Risk assessments
- Historical flood data
- Required flood insurance areas

## 💰 Financial & Credit Sources

### Consumer Financial Protection Bureau
**URL:** [consumerfinance.gov/data-research](https://www.consumerfinance.gov/data-research/)

**Available Data:**
- Consumer complaint database
- Financial well-being data
- Credit and loan statistics

### Federal Reserve Economic Data (FRED)
**URL:** [fred.stlouisfed.org](https://fred.stlouisfed.org)

**Available Data:**
- Economic indicators
- Regional economic data
- Interest rates
- Inflation data

## 🗺️ Geographic & Demographic Data

### US ZIP Codes Database
**URL:** [simplemaps.com/data/us-zips](https://simplemaps.com/data/us-zips)

**Available Data:**
- ZIP code coordinates
- Population density
- County/city mappings
- Time zones

### OpenStreetMap
**URL:** [openstreetmap.org](https://www.openstreetmap.org)

**Available Data:**
- Road networks (affects accident risk)
- Urban vs rural classifications
- Infrastructure data

## 📈 Market Research & Reviews

### Consumer Reports
**URL:** [consumerreports.org](https://www.consumerreports.org)

**Available Data:**
- Insurance company ratings
- Customer satisfaction surveys
- Best practices guides

### Better Business Bureau
**URL:** [bbb.org](https://www.bbb.org)

**Available Data:**
- Company ratings and accreditation
- Complaint histories
- Customer reviews

### Trustpilot
**URL:** [trustpilot.com](https://www.trustpilot.com)

**Available Data:**
- Customer reviews
- Company ratings
- Service feedback

## 🔌 API-Accessible Sources

### Free/Public APIs

| API | Data | Limits |
|-----|------|--------|
| **NHTSA Vehicle API** | VIN decode, recalls, complaints, ratings | Free, no auth |
| **OpenWeather API** | Weather data for risk assessment | Free tier: 1000 calls/day |
| **US Census API** | Demographics, income, housing | Free, API key required |
| **FEMA API** | Disaster declarations, flood data | Free, no auth |
| **ZIP Code API** | ZIP demographics, distances | Free tier available |

### Commercial APIs (with free tiers)

| API | Data | Free Tier |
|-----|------|-----------|
| **Clearbit** | Company data enrichment | 100 requests/month |
| **SmartyStreets** | Address validation, ZIP+4 | 250/month |
| **Here Maps** | Geocoding, traffic data | 250K transactions/month |
| **RapidAPI Insurance** | Multi-carrier quotes | Limited free tier |

## 📝 Content for Knowledge Base

### Educational Resources
- **Insurance.com**: Articles, guides, state requirements
- **NerdWallet Insurance**: Comparisons, calculators, guides
- **The Zebra**: State guides, statistics, research reports
- **ValuePenguin**: Insurance studies, state analyses
- **Policygenius**: Insurance guides, calculators, glossaries

### Legal Resources
- **Justia**: State insurance laws and codes
- **FindLaw**: Insurance law summaries
- **Cornell Law School**: Insurance regulations

## 🛠️ Data Collection Strategy

### Priority 1: State Requirements (Immediate)
```python
sources = [
    "NAIC state profiles",
    "Individual state DOI websites",
    "III state statistics"
]
```

### Priority 2: Carrier Intelligence (Week 1)
```python
sources = [
    "J.D. Power ratings",
    "AM Best financial ratings",
    "NAIC complaint ratios",
    "Consumer Reports ratings"
]
```

### Priority 3: Risk Data (Week 2)
```python
sources = [
    "NHTSA vehicle safety",
    "FBI crime statistics",
    "NOAA weather data",
    "FEMA flood zones"
]
```

### Priority 4: Market Data (Week 3)
```python
sources = [
    "Census demographics",
    "Zillow home values",
    "Economic indicators"
]
```

## 📊 Sample Data Import Script

```typescript
// scripts/import-public-data.ts

const PUBLIC_SOURCES = {
  stateRequirements: {
    naic: 'https://content.naic.org/api/state-profiles',
    california: 'https://www.insurance.ca.gov/01-consumers/105-type/95-guides/01-auto/auto-coverage.cfm'
  },

  vehicleSafety: {
    nhtsa: 'https://api.nhtsa.gov/SafetyRatings',
    iihs: 'https://www.iihs.org/api/ratings'
  },

  carrierRatings: {
    jdpower: 'https://www.jdpower.com/cars/insurance-ratings',
    amBest: 'https://web.ambest.com/ratings'
  },

  riskData: {
    crime: 'https://api.usa.gov/crime/fbi/sapi',
    weather: 'https://api.weather.gov',
    flood: 'https://hazards.fema.gov/gis/nfhl/rest/services'
  }
}
```

## 🔒 Legal & Compliance Notes

### When Scraping/Using Data:
1. **Check Terms of Service** - Ensure scraping is allowed
2. **Respect robots.txt** - Follow site crawling rules
3. **Rate Limiting** - Don't overwhelm servers
4. **Attribution** - Credit data sources properly
5. **Updates** - Set up regular refresh schedules
6. **Caching** - Cache data appropriately to reduce load

### Data Privacy:
- Don't collect personally identifiable information
- Aggregate and anonymize user data
- Follow CCPA/GDPR guidelines
- Secure API keys and credentials

## 💡 Implementation Tips

### For Vectorize.io:
1. Set up scheduled imports from APIs
2. Use webhooks for real-time updates
3. Create data pipelines for each source type
4. Monitor data freshness and quality

### Quality Control:
- Validate data accuracy
- Cross-reference multiple sources
- Flag outdated information
- Track source reliability scores

## 📅 Recommended Update Schedule

| Data Type | Update Frequency |
|-----------|------------------|
| State regulations | Monthly |
| Carrier ratings | Quarterly |
| Vehicle safety | Quarterly |
| Crime/risk data | Annually |
| Economic data | Monthly |
| Weather patterns | Seasonally |
| Reviews/complaints | Weekly |