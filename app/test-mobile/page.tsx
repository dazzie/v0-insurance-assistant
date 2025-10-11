"use client"

export default function TestMobile() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-4">Mobile Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-card border rounded-lg">
            <h2 className="text-lg font-semibold text-card-foreground">Card Test</h2>
            <p className="text-muted-foreground">This should have proper styling</p>
          </div>
          
          <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg">
            Primary Button
          </button>
          
          <button className="w-full bg-secondary text-secondary-foreground p-3 rounded-lg">
            Secondary Button
          </button>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">Grid Item 1</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">Grid Item 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

