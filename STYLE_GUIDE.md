# 🎨 Style Guide - Insurance Assistant

## Color Palette

### Primary Colors
- **Primary Blue**: `#3B82F6` (blue-500)
- **Primary Purple**: `#9333EA` (purple-600)
- **Primary Gradient**: `from-blue-500 to-purple-600`

### Success States
- **Green**: `#10B981` (green-500)
- **Light Green Background**: `bg-green-50`
- **Green Border**: `border-green-200`

### Warning/Alert
- **Amber**: `#F59E0B` (amber-500)
- **Red**: `#EF4444` (red-500)

### Neutral Colors
- **Background**: `hsl(var(--background))`
- **Foreground**: `hsl(var(--foreground))`
- **Muted**: `hsl(var(--muted))`
- **Border**: `hsl(var(--border))`

## Typography

### Headings
```css
h1: text-3xl font-bold (30px)
h2: text-2xl font-bold (24px)
h3: text-xl font-semibold (20px)
h4: text-lg font-semibold (18px)
```

### Body Text
```css
Large: text-lg (18px)
Base: text-base (16px)
Small: text-sm (14px)
Extra Small: text-xs (12px)
```

### Font Weights
- **Bold**: font-bold (700)
- **Semibold**: font-semibold (600)
- **Medium**: font-medium (500)
- **Regular**: font-normal (400)

## Components

### Quote Ready Banner

```jsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
  <div className="flex items-center justify-between">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🎉</span>
        <h1 className="text-3xl font-bold">Your Quotes Are Ready!</h1>
      </div>
      <p className="text-blue-100 text-lg">We found 4 competitive quotes</p>
      <p className="text-blue-200 text-sm mt-1">Based on your profile</p>
    </div>
    <div>
      <Badge className="bg-white text-blue-600 text-lg px-4 py-2">
        Potential Savings: $200+/year
      </Badge>
    </div>
  </div>
</div>
```

**Visual Effect:**
- Blue-to-purple gradient background
- White text for high contrast
- Large emoji for visual appeal
- Prominent savings badge in white

### Button Styles

#### Primary Button
```jsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Get Quote
</Button>
```

#### Outline Button
```jsx
<Button variant="outline">
  Back to Research
</Button>
```

#### Large Touch-Friendly Button (Mobile)
```jsx
<Button className="h-24 sm:h-32 flex flex-col gap-2 text-sm sm:text-base">
  <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
  <span>Take Photo</span>
</Button>
```

### Card Styles

#### Standard Card
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Highlighted Card (Best Option)
```jsx
<Card className="ring-2 ring-blue-500 relative">
  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
    Best Value
  </Badge>
  {/* Card content */}
</Card>
```

### Badge Styles

#### Success Badge
```jsx
<Badge className="bg-green-500 text-white">
  ✓ Verified
</Badge>
```

#### Info Badge
```jsx
<Badge variant="secondary">
  4.8/5 Rating
</Badge>
```

#### Savings Badge
```jsx
<Badge className="bg-white text-blue-600 text-lg px-4 py-2">
  Potential Savings: $200+/year
</Badge>
```

## Spacing

### Padding
- **Extra Small**: `p-2` (0.5rem / 8px)
- **Small**: `p-4` (1rem / 16px)
- **Medium**: `p-6` (1.5rem / 24px)
- **Large**: `p-8` (2rem / 32px)

### Gaps
- **Extra Small**: `gap-1` (0.25rem / 4px)
- **Small**: `gap-2` (0.5rem / 8px)
- **Medium**: `gap-4` (1rem / 16px)
- **Large**: `gap-6` (1.5rem / 24px)

### Margins
- **Small**: `mt-2, mb-2` (0.5rem / 8px)
- **Medium**: `mt-4, mb-4` (1rem / 16px)
- **Large**: `mt-6, mb-6` (1.5rem / 24px)

## Responsive Design

### Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1400px
```

### Mobile-First Approach
```jsx
{/* Mobile: p-2, Desktop (sm+): p-4 */}
<div className="p-2 sm:p-4">

{/* Mobile: text-sm, Desktop (sm+): text-base */}
<p className="text-sm sm:text-base">

{/* Mobile: 1 column, Desktop (sm+): 2 columns */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

## Icons

### Sizes
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-6 h-6` (24px)
- **Large**: `w-8 h-8` (32px)

### Icon Usage
```jsx
import { Camera, Upload, FileText, CheckCircle } from "lucide-react"

<Camera className="w-6 h-6 sm:w-8 sm:h-8" />
```

### Emoji Icons
- 🎉 - Success/Celebration
- 🎯 - Target/Goal
- ✅ - Completed/Verified
- ⚠️ - Warning
- 💡 - Recommendation
- 📱 - Mobile/Scan
- 📊 - Data/Comparison

## Animations

### Transitions
```jsx
className="transition-all hover:scale-105"
```

### Loading States
```jsx
<div className="animate-pulse bg-muted rounded-lg h-20" />
```

### Fade In
```jsx
className="opacity-0 animate-fade-in"
```

## Shadows

### Card Shadows
```css
shadow-sm: Small subtle shadow
shadow: Medium shadow
shadow-lg: Large prominent shadow
```

### Usage
```jsx
<Card className="shadow-lg">
  Prominent card
</Card>
```

## Forms

### Input Field
```jsx
<Input 
  placeholder="Enter your email"
  className="w-full"
/>
```

### Label
```jsx
<Label htmlFor="email" className="text-sm font-medium">
  Email Address
</Label>
```

### Error State
```jsx
<Input 
  className="border-destructive focus-visible:ring-destructive"
  aria-invalid="true"
/>
<p className="text-sm text-destructive mt-1">
  Please enter a valid email
</p>
```

## Mobile Optimizations

### Touch Targets
- **Minimum Size**: 44x44px (h-11 w-11)
- **Recommended**: 48x48px (h-12 w-12)
- **Large Buttons**: 96px+ (h-24+)

### Mobile-Specific Classes
```jsx
{/* Hidden on mobile, visible on desktop */}
<div className="hidden sm:block">

{/* Visible on mobile, hidden on desktop */}
<div className="sm:hidden">

{/* Full width on mobile, auto on desktop */}
<Button className="w-full sm:w-auto">
```

## Accessibility

### Color Contrast
- **Text on Background**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Clear focus states

### Focus States
```jsx
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### ARIA Labels
```jsx
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>
```

## Dark Mode Support

All colors use CSS variables that automatically adapt:

```css
:root {
  --background: oklch(0.9730 0.0133 286.1503);
  --foreground: oklch(0.3015 0.0572 282.4176);
}

.dark {
  --background: oklch(0.1743 0.0227 283.7998);
  --foreground: oklch(0.9185 0.0257 285.8834);
}
```

Usage:
```jsx
<div className="bg-background text-foreground">
  Automatically adapts to dark mode
</div>
```

## Best Practices

### Do's ✅
- Use semantic HTML elements
- Maintain consistent spacing
- Follow mobile-first approach
- Use Tailwind utility classes
- Keep color palette consistent
- Provide clear visual hierarchy
- Use proper contrast ratios
- Add loading states
- Include hover states
- Make touch targets large enough

### Don'ts ❌
- Don't use arbitrary values excessively
- Don't mix different spacing scales
- Don't skip focus states
- Don't use too many colors
- Don't ignore mobile experience
- Don't use tiny touch targets
- Don't forget dark mode
- Don't skip accessibility

---

**Last Updated**: 2025-01-06
**Version**: 1.0.0
**Framework**: Tailwind CSS + shadcn/ui

