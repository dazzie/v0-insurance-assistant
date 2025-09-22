"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Copy, Download, FileText, Phone, AlertTriangle, HelpCircle } from "lucide-react"
import { useState } from "react"

interface CarrierToolkitProps {
  toolkit: {
    summary: string
    questions: string[]
    negotiationTips: string[]
    documents: string[]
    strengths: string[]
    redFlags: string[]
  }
}

export function CarrierToolkit({ toolkit }: CarrierToolkitProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const downloadToolkit = () => {
    const content = formatToolkitForDownload(toolkit)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'insurance-shopping-toolkit.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Carrier Conversation Toolkit
            </CardTitle>
            <CardDescription>
              Everything you need for successful insurance shopping
            </CardDescription>
          </div>
          <Button onClick={downloadToolkit} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="negotiate">Negotiate</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="warnings">Warnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Your Profile Summary
              </h3>
              <Button
                onClick={() => copyToClipboard(toolkit.summary, 'summary')}
                variant="ghost"
                size="sm"
              >
                {copiedSection === 'summary' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
              {toolkit.summary}
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Questions to Ask Each Carrier
            </h3>
            <div className="space-y-2">
              {toolkit.questions.map((question, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                  <span className="font-semibold text-primary">{index + 1}.</span>
                  <span className="text-sm">{question}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="negotiate" className="space-y-4">
            <h3 className="font-semibold">Negotiation Strategies</h3>
            <div className="space-y-2">
              {toolkit.negotiationTips.map((tip, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <h3 className="font-semibold">Documents Checklist</h3>
            <div className="space-y-2">
              {toolkit.documents.map((doc, index) => (
                <label key={index} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{doc}</span>
                </label>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="strengths" className="space-y-4">
            <h3 className="font-semibold text-green-600 dark:text-green-400">
              Your Strengths to Emphasize
            </h3>
            <div className="space-y-2">
              {toolkit.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="warnings" className="space-y-4">
            <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Red Flags to Watch For
            </h3>
            <div className="space-y-2">
              {toolkit.redFlags.map((flag, index) => (
                <div key={index} className="p-2 bg-red-50 dark:bg-red-950/30 rounded text-sm">
                  {flag}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <p className="text-sm text-center">
            💡 <strong>Pro Tip:</strong> Call carriers Tuesday-Thursday, late morning or mid-afternoon for best results
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function formatToolkitForDownload(toolkit: any): string {
  let content = 'INSURANCE SHOPPING TOOLKIT\n'
  content += '=' .repeat(50) + '\n\n'
  
  content += 'PROFILE SUMMARY\n'
  content += '-'.repeat(30) + '\n'
  content += toolkit.summary + '\n\n'
  
  content += 'QUESTIONS TO ASK\n'
  content += '-'.repeat(30) + '\n'
  toolkit.questions.forEach((q: string, i: number) => {
    content += `${i + 1}. ${q}\n`
  })
  content += '\n'
  
  content += 'NEGOTIATION STRATEGIES\n'
  content += '-'.repeat(30) + '\n'
  toolkit.negotiationTips.forEach((tip: string) => {
    content += `• ${tip}\n`
  })
  content += '\n'
  
  content += 'DOCUMENTS CHECKLIST\n'
  content += '-'.repeat(30) + '\n'
  toolkit.documents.forEach((doc: string) => {
    content += `☐ ${doc}\n`
  })
  content += '\n'
  
  content += 'YOUR STRENGTHS\n'
  content += '-'.repeat(30) + '\n'
  toolkit.strengths.forEach((strength: string) => {
    content += `✓ ${strength}\n`
  })
  content += '\n'
  
  content += 'RED FLAGS TO AVOID\n'
  content += '-'.repeat(30) + '\n'
  toolkit.redFlags.forEach((flag: string) => {
    content += `⚠️ ${flag}\n`
  })
  
  return content
}