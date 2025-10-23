'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Calculator, MapPin, User, Car } from 'lucide-react';

interface TestProfile {
  id: string;
  name: string;
  description: string;
  age: number;
  creditTier: string;
  vehicleType: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  annualMileage: number;
  violations: number;
  accidents: number;
  deductible: number;
  coverageLevel: string;
  bundleHome: boolean;
  location: string;
}

interface QuoteResult {
  carrierName: string;
  monthlyPremium: number;
  officialRate?: number;
  difference?: number;
  percentDiff?: number;
  status: 'accurate' | 'off-target';
}

const testProfiles: TestProfile[] = [
  {
    id: 'tesla-sf-35',
    name: 'Tesla Model S - SF Professional',
    description: '35-year-old professional in San Francisco with Tesla Model S',
    age: 35,
    creditTier: 'good',
    vehicleType: 'luxury',
    vehicleYear: 2015,
    vehicleMake: 'Tesla',
    vehicleModel: 'Model S',
    annualMileage: 12000,
    violations: 0,
    accidents: 0,
    deductible: 500,
    coverageLevel: 'standard',
    bundleHome: false,
    location: 'San Francisco, CA'
  },
  {
    id: 'honda-la-28',
    name: 'Honda Civic - LA Young Professional',
    description: '28-year-old in Los Angeles with Honda Civic',
    age: 28,
    creditTier: 'fair',
    vehicleType: 'sedan',
    vehicleYear: 2020,
    vehicleMake: 'Honda',
    vehicleModel: 'Civic',
    annualMileage: 15000,
    violations: 1,
    accidents: 0,
    deductible: 1000,
    coverageLevel: 'standard',
    bundleHome: false,
    location: 'Los Angeles, CA'
  },
  {
    id: 'toyota-sd-45',
    name: 'Toyota Camry - SD Family',
    description: '45-year-old family in San Diego with Toyota Camry',
    age: 45,
    creditTier: 'excellent',
    vehicleType: 'sedan',
    vehicleYear: 2018,
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    annualMileage: 10000,
    violations: 0,
    accidents: 0,
    deductible: 500,
    coverageLevel: 'enhanced',
    bundleHome: true,
    location: 'San Diego, CA'
  },
  {
    id: 'bmw-nyc-32',
    name: 'BMW 3 Series - NYC Executive',
    description: '32-year-old executive in New York with BMW 3 Series',
    age: 32,
    creditTier: 'excellent',
    vehicleType: 'luxury',
    vehicleYear: 2021,
    vehicleMake: 'BMW',
    vehicleModel: '3 Series',
    annualMileage: 8000,
    violations: 0,
    accidents: 0,
    deductible: 500,
    coverageLevel: 'premium',
    bundleHome: true,
    location: 'New York, NY'
  },
  {
    id: 'ford-buffalo-55',
    name: 'Ford F-150 - Buffalo Contractor',
    description: '55-year-old contractor in Buffalo with Ford F-150',
    age: 55,
    creditTier: 'good',
    vehicleType: 'truck',
    vehicleYear: 2019,
    vehicleMake: 'Ford',
    vehicleModel: 'F-150',
    annualMileage: 25000,
    violations: 0,
    accidents: 1,
    deductible: 1000,
    coverageLevel: 'standard',
    bundleHome: false,
    location: 'Buffalo, NY'
  },
  {
    id: 'subaru-albany-29',
    name: 'Subaru Outback - Albany Outdoor Enthusiast',
    description: '29-year-old outdoor enthusiast in Albany with Subaru Outback',
    age: 29,
    creditTier: 'good',
    vehicleType: 'suv',
    vehicleYear: 2022,
    vehicleMake: 'Subaru',
    vehicleModel: 'Outback',
    annualMileage: 18000,
    violations: 0,
    accidents: 0,
    deductible: 500,
    coverageLevel: 'standard',
    bundleHome: true,
    location: 'Albany, NY'
  },
  {
    id: 'mercedes-oakland-41',
    name: 'Mercedes C-Class - Oakland Tech',
    description: '41-year-old tech worker in Oakland with Mercedes C-Class',
    age: 41,
    creditTier: 'excellent',
    vehicleType: 'luxury',
    vehicleYear: 2020,
    vehicleMake: 'Mercedes',
    vehicleModel: 'C-Class',
    annualMileage: 14000,
    violations: 0,
    accidents: 0,
    deductible: 250,
    coverageLevel: 'premium',
    bundleHome: true,
    location: 'Oakland, CA'
  },
  {
    id: 'nissan-sacramento-26',
    name: 'Nissan Altima - Sacramento Recent Grad',
    description: '26-year-old recent graduate in Sacramento with Nissan Altima',
    age: 26,
    creditTier: 'fair',
    vehicleType: 'sedan',
    vehicleYear: 2017,
    vehicleMake: 'Nissan',
    vehicleModel: 'Altima',
    annualMileage: 20000,
    violations: 2,
    accidents: 0,
    deductible: 1000,
    coverageLevel: 'minimum',
    bundleHome: false,
    location: 'Sacramento, CA'
  },
  {
    id: 'audi-rochester-38',
    name: 'Audi A4 - Rochester Professional',
    description: '38-year-old professional in Rochester with Audi A4',
    age: 38,
    creditTier: 'good',
    vehicleType: 'luxury',
    vehicleYear: 2019,
    vehicleMake: 'Audi',
    vehicleModel: 'A4',
    annualMileage: 12000,
    violations: 0,
    accidents: 0,
    deductible: 500,
    coverageLevel: 'enhanced',
    bundleHome: false,
    location: 'Rochester, NY'
  },
  {
    id: 'chevrolet-syracuse-52',
    name: 'Chevrolet Malibu - Syracuse Retiree',
    description: '52-year-old retiree in Syracuse with Chevrolet Malibu',
    age: 52,
    creditTier: 'good',
    vehicleType: 'sedan',
    vehicleYear: 2016,
    vehicleMake: 'Chevrolet',
    vehicleModel: 'Malibu',
    annualMileage: 8000,
    violations: 0,
    accidents: 0,
    deductible: 500,
    coverageLevel: 'standard',
    bundleHome: true,
    location: 'Syracuse, NY'
  }
];

const officialRates = {
  CA: {
    'Progressive': 138,
    'GEICO': 143,
    'State Farm': 158,
    'Allstate': 165,
    'USAA': 142,
    'Liberty Mutual': 155,
    'Farmers': 162,
    'Nationwide': 148,
    'Travelers': 151,
    'American Family': 145
  },
  NY: {
    'Progressive': 145,
    'GEICO': 152,
    'State Farm': 168,
    'Allstate': 175,
    'USAA': 150,
    'Liberty Mutual': 165,
    'Farmers': 172,
    'Nationwide': 158,
    'Travelers': 161,
    'American Family': 155
  }
};

export default function QuoteValidationPage() {
  const [selectedProfile, setSelectedProfile] = useState<TestProfile>(testProfiles[0]);
  const [selectedState, setSelectedState] = useState<'CA' | 'NY'>('CA');
  const [quoteResults, setQuoteResults] = useState<QuoteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accuracy, setAccuracy] = useState<number>(0);

  const generateQuotes = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/fetch-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuranceType: 'auto',
          state: selectedState,
          age: selectedProfile.age,
          creditTier: selectedProfile.creditTier,
          vehicleType: selectedProfile.vehicleType,
          vehicleYear: selectedProfile.vehicleYear,
          vehicleMake: selectedProfile.vehicleMake,
          vehicleModel: selectedProfile.vehicleModel,
          annualMileage: selectedProfile.annualMileage,
          violations: selectedProfile.violations,
          accidents: selectedProfile.accidents,
          deductible: selectedProfile.deductible,
          coverageLevel: selectedProfile.coverageLevel,
          bundleHome: selectedProfile.bundleHome
        })
      });

      const data = await response.json();
      const quotes = data.quotes || [];
      
      // Compare with official rates
      const results: QuoteResult[] = quotes.map((quote: any) => {
        const official = officialRates[selectedState][quote.carrierName];
        if (official) {
          const difference = quote.monthlyPremium - official;
          const percentDiff = (difference / official) * 100;
          const isAccurate = Math.abs(percentDiff) <= 15;
          
          return {
            carrierName: quote.carrierName,
            monthlyPremium: quote.monthlyPremium,
            officialRate: official,
            difference,
            percentDiff,
            status: isAccurate ? 'accurate' : 'off-target'
          };
        }
        return {
          carrierName: quote.carrierName,
          monthlyPremium: quote.monthlyPremium,
          status: 'off-target'
        };
      });

      setQuoteResults(results);
      
      // Calculate accuracy
      const accurateCount = results.filter(r => r.status === 'accurate').length;
      const totalCount = results.length;
      setAccuracy(totalCount > 0 ? (accurateCount / totalCount) * 100 : 0);
      
    } catch (error) {
      console.error('Error generating quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateQuotes();
  }, [selectedProfile, selectedState]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Engine Validation</h1>
          <p className="text-lg text-gray-600">Test quote accuracy across different profiles and states</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Test Profile Selection
                </CardTitle>
                <CardDescription>
                  Choose from 10 different test profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Select value={selectedState} onValueChange={(value: 'CA' | 'NY') => setSelectedState(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Profile
                  </label>
                  <Select 
                    value={selectedProfile.id} 
                    onValueChange={(value) => {
                      const profile = testProfiles.find(p => p.id === value);
                      if (profile) setSelectedProfile(profile);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {testProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Profile Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedProfile.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Age: {selectedProfile.age}, Credit: {selectedProfile.creditTier}
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      {selectedProfile.vehicleYear} {selectedProfile.vehicleMake} {selectedProfile.vehicleModel}
                    </div>
                    <div className="text-xs">
                      Mileage: {selectedProfile.annualMileage.toLocaleString()}/year
                    </div>
                    <div className="text-xs">
                      Record: {selectedProfile.violations} violations, {selectedProfile.accidents} accidents
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={generateQuotes} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Generating...' : 'Generate Quotes'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Validation Results</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Quote Validation Results for {selectedState}
                    </CardTitle>
                    <CardDescription>
                      Comparing our quotes against official {selectedState} DOI rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Generating quotes...</p>
                      </div>
                    ) : quoteResults.length > 0 ? (
                      <div className="space-y-4">
                        {quoteResults.map((result, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-lg">{result.carrierName}</h3>
                              <Badge 
                                variant={result.status === 'accurate' ? 'default' : 'destructive'}
                                className="flex items-center gap-1"
                              >
                                {result.status === 'accurate' ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                {result.status === 'accurate' ? 'Accurate' : 'Off Target'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Our Quote:</span>
                                <span className="ml-2 font-medium">${result.monthlyPremium}/mo</span>
                              </div>
                              {result.officialRate && (
                                <>
                                  <div>
                                    <span className="text-gray-600">Official:</span>
                                    <span className="ml-2 font-medium">${result.officialRate}/mo</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Difference:</span>
                                    <span className={`ml-2 font-medium ${result.difference && result.difference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      ${result.difference && result.difference > 0 ? '+' : ''}{result.difference}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Percentage:</span>
                                    <span className={`ml-2 font-medium ${result.percentDiff && result.percentDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {result.percentDiff && result.percentDiff > 0 ? '+' : ''}{result.percentDiff?.toFixed(1)}%
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select a profile and state to generate quotes
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Validation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quoteResults.length > 0 ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {accuracy.toFixed(1)}% Accuracy
                          </div>
                          <div className="text-lg text-gray-600 mb-4">
                            {accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : accuracy >= 40 ? 'Needs Improvement' : 'Needs Calibration'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {quoteResults.filter(r => r.status === 'accurate').length}
                            </div>
                            <div className="text-green-700">Accurate Quotes</div>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {quoteResults.filter(r => r.status === 'off-target').length}
                            </div>
                            <div className="text-red-700">Off Target</div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p><strong>Profile:</strong> {selectedProfile.name}</p>
                          <p><strong>State:</strong> {selectedState}</p>
                          <p><strong>Vehicle:</strong> {selectedProfile.vehicleYear} {selectedProfile.vehicleMake} {selectedProfile.vehicleModel}</p>
                          <p><strong>Coverage:</strong> {selectedProfile.coverageLevel} level</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Generate quotes to see summary
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
