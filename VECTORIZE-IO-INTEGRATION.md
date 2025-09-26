# Vectorize.io Integration Guide

## Overview
Vectorize.io provides a web-based UI for managing your vector databases, making it easy to upload, manage, and monitor your data sources without writing code.

## Using Vectorize.io Dashboard

### 1. Access Vectorize.io
- Go to [https://vectorize.io](https://vectorize.io) or through Cloudflare Dashboard
- Sign in with your Cloudflare account
- Navigate to your account's Vectorize section

### 2. Create Indexes via UI
Instead of programmatically creating indexes, you can create them in the dashboard:

1. Click "Create Index"
2. Configure each index:
   ```
   Name: insurance-knowledge
   Dimensions: 1536 (for OpenAI text-embedding-3-small)
   Metric: cosine
   ```

3. Repeat for all indexes:
   - `insurance-knowledge`
   - `quote-history`
   - `carrier-intelligence`
   - `conversation-context`
   - `local-market`

### 3. Data Import Options in Vectorize.io

#### Option A: CSV Upload
Prepare CSV files with the following structure:

**insurance-knowledge.csv**
```csv
id,content,type,insurance_type,state,title,source,embedding
ca_auto_min_2024,"California requires minimum liability insurance...","regulation","auto","CA","California Minimum Auto Insurance","CA DOI","[0.123, 0.456, ...]"
tx_auto_min_2024,"Texas requires 30/60/25 coverage...","regulation","auto","TX","Texas Minimum Auto Insurance","TX DOI","[0.234, 0.567, ...]"
```

**carrier-intelligence.csv**
```csv
id,content,carrier,category,rating,ideal_age_min,ideal_age_max,embedding
geico_profile,"GEICO is known for competitive rates...","GEICO","profile",4.2,25,65,"[0.345, 0.678, ...]"
progressive_profile,"Progressive specializes in high-risk...","Progressive","profile",4.0,18,70,"[0.456, 0.789, ...]"
```

#### Option B: JSON Upload
Prepare JSON files with embedded vectors:

**insurance-knowledge.json**
```json
{
  "vectors": [
    {
      "id": "ca_auto_min_2024",
      "values": [0.123, 0.456, ...],
      "metadata": {
        "content": "California requires minimum liability insurance...",
        "type": "regulation",
        "insuranceType": "auto",
        "state": "CA",
        "title": "California Minimum Auto Insurance",
        "source": "CA DOI"
      }
    }
  ]
}
```

#### Option C: Direct API Upload via UI
Use the Vectorize.io API playground to upload data directly:

1. Go to API Playground in dashboard
2. Select your index
3. Use the "Upsert" operation
4. Paste your vector data
5. Execute

### 4. Connecting External Data Sources

#### Google Sheets Integration
1. Prepare your data in Google Sheets
2. In Vectorize.io, go to "Data Sources"
3. Click "Connect Google Sheets"
4. Authorize and select your sheet
5. Map columns to vector fields:
   - Content column → Generate embeddings
   - Metadata columns → Store as metadata

#### Database Connections
Vectorize.io supports direct connections to:
- PostgreSQL
- MySQL
- MongoDB
- Supabase

Setup:
1. Go to "Data Sources" → "Add Database"
2. Enter connection details
3. Write SQL query to fetch data
4. Configure sync schedule (hourly, daily, etc.)

#### File Storage Integration
- **AWS S3**: Connect S3 buckets with insurance documents
- **Google Cloud Storage**: Sync GCS buckets
- **Dropbox/Box**: Direct file sync

### 5. Automated Data Pipeline

Create an automated pipeline in Vectorize.io:

```yaml
# vectorize-pipeline.yaml
name: insurance-knowledge-pipeline
schedule: "0 2 * * *" # Daily at 2 AM

sources:
  - type: google-sheets
    id: state-regulations
    sheet_id: "your-sheet-id"
    range: "A1:Z1000"

  - type: postgres
    id: carrier-database
    query: |
      SELECT id, carrier_name, description, ratings
      FROM carriers
      WHERE updated_at > :last_sync

  - type: s3
    id: policy-documents
    bucket: insurance-docs
    prefix: policies/
    file_types: [pdf, txt, json]

processing:
  - step: clean_text
    remove_html: true
    normalize_whitespace: true

  - step: chunk_documents
    max_size: 1000
    overlap: 200

  - step: generate_embeddings
    model: text-embedding-3-small
    batch_size: 100

destination:
  index: insurance-knowledge
  upsert: true
  metadata_mapping:
    type: doc_type
    state: state_code
    insuranceType: insurance_category
```

## Hybrid Approach: Vectorize.io + Code

### Best Practice Setup

1. **Use Vectorize.io for**:
   - Static knowledge base (regulations, definitions)
   - Carrier information
   - Market data
   - Manual data corrections/updates

2. **Use Code for**:
   - Dynamic data (conversation context)
   - Real-time quote history
   - User-generated content
   - Programmatic updates

### Modified Code Integration

Update your `vectorize-client.ts` to work with pre-existing indexes:

```typescript
// lib/rag/core/vectorize-client.ts (modified)

export class VectorizeClient {
  // ... existing code ...

  async initializeIndexes(): Promise<void> {
    console.log('[VectorizeClient] Checking indexes...')

    for (const [indexName, config] of this.indexes) {
      try {
        // Check if index exists (created via Vectorize.io)
        const stats = await this.getIndexStats(indexName)
        console.log(`✓ Index ${config.name} exists with ${stats.vectorCount} vectors`)
      } catch (error: any) {
        if (error.message.includes('not found')) {
          console.log(`Creating index ${config.name}...`)
          await this.createIndex(indexName)
        }
      }
    }
  }

  // Add method to sync with Vectorize.io data
  async syncWithVectorizeIO(indexName: VectorIndexName): Promise<void> {
    const stats = await this.getIndexStats(indexName)
    console.log(`[Sync] ${indexName}: ${stats.vectorCount} vectors from Vectorize.io`)

    // Your code can now query this pre-loaded data
    return stats
  }
}
```

### Data Management Script

```typescript
// scripts/sync-vectorize-io.ts

import { VectorizeClient } from '../lib/rag/core/vectorize-client'

async function syncWithVectorizeIO() {
  const client = new VectorizeClient()

  // Check what's loaded via Vectorize.io
  const indexes: Array<VectorIndexName> = ['knowledge', 'carriers', 'market']

  for (const indexName of indexes) {
    const stats = await client.syncWithVectorizeIO(indexName)
    console.log(`${indexName}: ${stats.vectorCount} vectors loaded via Vectorize.io`)
  }

  // Only programmatically update dynamic indexes
  const dynamicIndexes = ['conversation', 'quotes']
  // ... handle dynamic data
}
```

## Data Source Examples for Vectorize.io

### 1. Insurance Regulations Spreadsheet
Create a Google Sheet with:
| ID | State | Type | Content | Insurance_Type | Last_Updated |
|----|-------|------|---------|----------------|--------------|
| ca_auto_001 | CA | regulation | California requires 15/30/5... | auto | 2024-01-01 |
| tx_auto_001 | TX | regulation | Texas requires 30/60/25... | auto | 2024-01-01 |

### 2. Carrier Database (PostgreSQL)
```sql
CREATE TABLE carrier_intelligence (
  id VARCHAR(50) PRIMARY KEY,
  carrier_name VARCHAR(100),
  category VARCHAR(50),
  content TEXT,
  overall_rating DECIMAL(3,2),
  ideal_age_min INT,
  ideal_age_max INT,
  last_updated TIMESTAMP
);
```

### 3. Policy Documents (S3)
Structure your S3 bucket:
```
insurance-docs/
├── regulations/
│   ├── CA/
│   │   ├── auto-minimum-2024.pdf
│   │   └── home-requirements-2024.pdf
│   └── TX/
│       └── auto-minimum-2024.pdf
├── carrier-policies/
│   ├── geico/
│   ├── progressive/
│   └── statefarm/
└── faqs/
    └── common-questions.json
```

## Monitoring & Management

### Vectorize.io Dashboard Features
1. **Vector Count Monitoring**: See total vectors per index
2. **Query Analytics**: Track search performance
3. **Data Quality**: View embedding distribution
4. **Cost Tracking**: Monitor API usage and costs
5. **Version Control**: Track data updates

### Alerts & Notifications
Set up alerts in Vectorize.io:
- Low vector count warnings
- Failed sync notifications
- Query performance degradation
- Cost threshold alerts

## Best Practices

### 1. Data Organization
- Use consistent ID formats: `{state}_{type}_{date}`
- Include version info in metadata
- Tag content with categories for filtering

### 2. Update Strategy
- **Static content** (regulations): Monthly updates via Vectorize.io
- **Semi-static** (carrier info): Weekly sync
- **Dynamic** (conversations): Real-time via code

### 3. Quality Control
- Validate embeddings before upload
- Test search quality after bulk updates
- Keep backup of previous versions
- Monitor relevance scores

### 4. Cost Optimization
- Pre-generate embeddings for static content
- Batch uploads during off-peak hours
- Use appropriate chunking to avoid redundancy
- Cache frequently accessed vectors

## Migration Path

If you have existing data to migrate:

1. **Export existing data** to CSV/JSON
2. **Generate embeddings** using the script:
   ```bash
   npx tsx scripts/generate-embeddings.ts --input data.csv --output data-with-embeddings.csv
   ```
3. **Upload to Vectorize.io** via dashboard
4. **Verify** with test queries
5. **Update code** to use pre-loaded indexes

## Support & Resources

- **Vectorize.io Docs**: [https://vectorize.io/docs](https://vectorize.io/docs)
- **Cloudflare Vectorize**: [https://developers.cloudflare.com/vectorize](https://developers.cloudflare.com/vectorize)
- **Support**: Dashboard → Help → Contact Support