"use client"

import { InsuranceSummaryComparison } from "@/components/insurance-summary-comparison"
import { generateInsuranceComparisons } from "@/lib/insurance-comparison-generator"

export function DemoSummary() {
  // Demo data for different insurance types
  const demoScenarios = [
    {
      insuranceType: "Auto",
      customerProfile: {
        location: "California, US",
        age: 28,
        needs: ["comprehensive coverage", "roadside assistance", "rental car coverage"]
      }
    },
    {
      insuranceType: "Home",
      customerProfile: {
        location: "Texas, US", 
        age: 35,
        needs: ["dwelling coverage", "personal property protection", "liability coverage"]
      }
    },
    {
      insuranceType: "Life",
      customerProfile: {
        location: "New York, US",
        age: 42,
        needs: ["term life insurance", "family protection", "financial security"]
      }
    },
    {
      insuranceType: "Health",
      customerProfile: {
        location: "Florida, US",
        age: 31,
        needs: ["preventive care", "prescription coverage", "mental health services"]
      }
    },
    {
      insuranceType: "Disability",
      customerProfile: {
        location: "Washington, US",
        age: 38,
        needs: ["income protection", "short-term disability", "long-term disability"]
      }
    }
  ]

  const handleContactCarrier = (carrier: any) => {
    console.log("Contact carrier:", carrier.carrierName)
    // In a real app, this would open carrier contact info
  }

  const handleGetQuote = (carrier: any) => {
    console.log("Get quote for:", carrier.carrierName)
    // In a real app, this would redirect to carrier quote page
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Insurance Summary Comparison Demo</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive side-by-side comparisons for all lines of business
        </p>
      </div>

      {demoScenarios.map((scenario, index) => {
        const comparisons = generateInsuranceComparisons(
          scenario.insuranceType,
          scenario.customerProfile,
          3
        )

        return (
          <div key={scenario.insuranceType} className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">{scenario.insuranceType} Insurance Example</h2>
              <p className="text-muted-foreground">
                {scenario.customerProfile.age}-year-old in {scenario.customerProfile.location}
              </p>
            </div>
            
            <InsuranceSummaryComparison
              comparisons={comparisons}
              insuranceType={scenario.insuranceType}
              customerProfile={scenario.customerProfile}
              onContactCarrier={handleContactCarrier}
              onGetQuote={handleGetQuote}
            />
          </div>
        )
      })}
    </div>
  )
}
<<<<<<< Updated upstream
=======



<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
