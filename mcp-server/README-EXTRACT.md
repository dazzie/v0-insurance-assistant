# Extract Text From Image MCP Server

A reusable, stateless MCP tool for extracting text and structured data from images using GPT-4o Vision.

## Why MCP?

| Feature | Why It Fits MCP |
|---------|----------------|
| **Discrete capability** | ✔ Clearly defined input/output |
| **Stateless** | ✔ No shared context needed |
| **Reusable** | ✔ Any agent can call it |
| **AI-native** | ✔ Uses multimodal LLM (GPT-4o) |
| **Extendable** | ✔ Schema-based; composable |

## Architecture Benefits

### Reusable Agentic Skill
Multiple agents (claims, underwriting, onboarding, etc.) can call a common "ExtractTextFromImage" capability without duplicating logic.

### Context Boundary
OCR or image understanding is self-contained; results are passed back as structured JSON to any reasoning chain.

### Composable Workflows
Can be chained in agent workflows:
```
Extract → Classify → Summarize → Store → Notify
```

### LLM Alignment
The input/output format is already natural to LLM function calls — image URL + JSON schema output.

### Interoperability
The same MCP can be used by Firecrawl, LangChain, AutoGen, or any multi-agent framework that supports MCP.

## Features

- **GPT-4o Vision Integration**: Multimodal text extraction with understanding
- **Structured JSON Output**: Uses `response_format: { type: 'json_object' }` for reliable parsing
- **Multiple Extraction Types**:
  - `general`: Extract all readable text and structured data
  - `insurance`: Comprehensive policy document extraction
  - `invoice`: Invoice details extraction
  - `receipt`: Receipt information extraction
- **Fallback Support**: Tesseract.js offline OCR capability (optional)

## Installation

```bash
cd mcp-server
npm install
```

## Usage

### Start the MCP Server

```bash
npm run start:extract
```

### Tool Schema

```json
{
  "name": "extract_text_from_image",
  "inputSchema": {
    "type": "object",
    "properties": {
      "filePath": {
        "type": "string",
        "description": "Absolute path to the image file (PNG or JPG)"
      },
      "extractionType": {
        "type": "string",
        "enum": ["general", "insurance", "invoice", "receipt"],
        "default": "general"
      },
      "useFallback": {
        "type": "boolean",
        "default": false
      }
    },
    "required": ["filePath"]
  }
}
```

### Example Call

```javascript
{
  "name": "extract_text_from_image",
  "arguments": {
    "filePath": "/path/to/policy.jpg",
    "extractionType": "insurance"
  }
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "customerName": "John Doe",
    "carrier": "GEICO",
    "policyNumber": "ABC123456",
    "effectiveDate": "01/01/2025",
    "expirationDate": "07/01/2025",
    "vehicles": [
      {
        "year": 2020,
        "make": "Honda",
        "model": "Civic",
        "vin": "1HGBH41JXMN109186"
      }
    ],
    "totalPremium": "$1,200/year",
    "coverages": [
      {
        "type": "Liability",
        "limit": "100/300/100",
        "premium": "$600"
      }
    ]
  },
  "method": "gpt-4o-vision",
  "extractionType": "insurance",
  "fieldsExtracted": 8
}
```

## Extraction Types

### General
Extracts all readable text and key-value pairs from any document image.

### Insurance
Comprehensive extraction for insurance policy documents:
- Customer information (name, DOB, address, email, phone)
- Policy details (carrier, number, dates, agent)
- Coverage information (types, limits, deductibles, premiums)
- Vehicle/property details
- Driver information
- Discounts and recommendations

### Invoice
Extracts invoice-specific fields:
- Invoice number, date, vendor
- Line items with quantities and prices
- Subtotal, tax, total

### Receipt
Extracts receipt information:
- Merchant name and address
- Date/time
- Items and prices
- Payment method
- Total amount

## Modern Stack Integration

```
┌─────────────────────────────────────┐
│  Image ingestion                    │
│  Next.js API Route / Upload         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Text + Data extraction             │
│  GPT-4o Vision (this MCP)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Fallback (offline)                 │
│  Tesseract.js                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Agent orchestration                │
│  Interpret, validate, enrich        │
└─────────────────────────────────────┘
```

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
```

## Error Handling

The tool returns structured error responses:

```json
{
  "success": false,
  "error": "File not found: /path/to/image.jpg",
  "filePath": "image.jpg"
}
```

## Future Enhancements

- [ ] Tesseract.js fallback implementation
- [ ] Batch image processing
- [ ] Confidence scoring for extracted fields
- [ ] Support for additional image formats (TIFF, BMP)
- [ ] PDF page extraction support
- [ ] Custom extraction schemas via user-provided JSON schema

## License

MIT
