
# Vectorize.io Upload Instructions

## Files Generated
- insurance-knowledge.csv - Insurance regulations, definitions, FAQs
- carrier-intelligence.csv - Carrier profiles and ratings
- insurance-knowledge-vectorize.json - Vectorize-formatted JSON for knowledge
- carrier-intelligence-vectorize.json - Vectorize-formatted JSON for carriers

## Upload Steps

### Option 1: CSV Upload
1. Go to Vectorize.io dashboard
2. Select your index (insurance-knowledge or carrier-intelligence)
3. Click "Import Data" → "CSV"
4. Upload the corresponding CSV file
5. Map columns:
   - id → ID field
   - embedding → Vector field
   - All others → Metadata fields

### Option 2: JSON Upload (Recommended)
1. Go to Vectorize.io dashboard
2. Select your index
3. Click "Import Data" → "JSON"
4. Upload the corresponding -vectorize.json file
5. Confirm the import

### Option 3: API Upload
Use the Vectorize API playground with the JSON files

## Index Configuration
Ensure your indexes are configured with:
- Dimensions: 1536
- Metric: cosine
- Names:
  - insurance-knowledge
  - carrier-intelligence

## Verification
After upload, test with queries like:
- "What's the minimum auto insurance in California?"
- "Tell me about GEICO"
