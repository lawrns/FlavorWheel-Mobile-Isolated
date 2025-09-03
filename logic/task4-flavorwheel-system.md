# FlavorWheel Creation System Deep-Dive

## Input Methods

### 1. Prose-Based Input (Study Mode)
**Location**: `/en/create/study` - Evaluation categories with subjective input
**Mechanism**:
- Free-form text input for aroma, flavor, texture descriptions
- No character limits, supports detailed tasting notes
- Contextual hints based on selected flavors
- Auto-save prevents data loss

**Data Processing**:
```typescript
// From flavor-analysis-service.ts
function extractFlavorsFromText(text: string): string[] {
  // 1. Multilingual extraction with dictionary lookup
  // 2. Fallback to simple word extraction
  // 3. Returns array of flavor keywords
}
```

### 2. Structured Selection (Quick Tasting)
**Location**: `/quick-tasting` - Flavor grid with intensity sliders
**Mechanism**:
- Pre-populated flavor options based on product type
- Toggle selection with visual feedback
- Intensity sliders (0-10 scale) for selected flavors
- Custom flavor addition with text input

**Data Structure**:
```typescript
interface FlavorDescriptor {
  id: string
  name: string
  intensity: number      // 0-10 scale
  selected: boolean
  isCustom?: boolean
}
```

### 3. Template-Driven Creation
**Location**: Study mode template selector
**Mechanism**:
- Pre-configured evaluation criteria
- Product-type specific templates
- Difficulty levels (beginner, intermediate, professional)
- Structured category types (scale, text, multiple choice)

### 4. Advanced Category Configuration
**Location**: Study mode category builder
**Supported Types**:
- **Subjective Input**: Free-form prose notes
- **Sliding Scale**: Interactive 1-100 rating sliders
- **Multiple Choice**: Predefined option selection
- **Exact Answer**: Precise text matching
- **Contains X**: Fuzzy text matching with variations

## Data Structures

### Core Flavor Data Format
```typescript
interface FlavorWheelData {
  name: string
  color: string
  percentage: number
  intensity: number
  count: number
  subcategories?: {
    name: string
    percentage: number
    intensity: number
    descriptors?: {
      name: string
      percentage: number
      intensity: number
      regions: string[]
      beverageTypes: string[]
    }[]
  }[]
}
```

### Hierarchical Organization
1. **Top Level**: Major flavor categories (Frutal, Floral, Herbal, etc.)
2. **Subcategories**: Specific flavor families (Cítricos, Frutas Tropicales, etc.)
3. **Descriptors**: Individual flavor terms with metadata

### Mexican Cultural Integration
```typescript
const MEXICAN_FLAVOR_CATEGORIES = {
  Frutal: { color: '#FF6B6B', subcategories: ['Cítricos', 'Frutas Tropicales'] },
  Floral: { color: '#FF9F43', subcategories: ['Flores Blancas', 'Flores Silvestres'] },
  Herbal: { color: '#26de81', subcategories: ['Hierbas Medicinales', 'Especias'] },
  Ahumado: { color: '#4834d4', subcategories: ['Humo de Leña', 'Tierra Cocida'] },
  // ... additional categories
}
```

## Processing Algorithms

### 1. Flavor Extraction Pipeline
```typescript
// Multi-stage processing in flavor-analysis-service.ts
function analyzeTastingData(tastings, config) {
  // 1. Extract flavors from different sources
  // 2. Apply multilingual enhancement
  // 3. Categorize descriptors
  // 4. Calculate frequencies and intensities
  // 5. Group by beverage types and regions
}
```

### 2. Multilingual Flavor Matching
**Technologies Used**:
- **Jaro-Winkler Similarity**: Advanced string matching algorithm
- **Lemma-based Matching**: Morphological variant handling
- **N-gram Phrase Matching**: Compound term recognition
- **Dictionary Lookup**: Exact and fuzzy keyword matching

**Supported Languages**:
- Spanish (es-MX) - Primary with cultural context
- English (en) - Secondary with technical terms

### 3. Intensity Calculation
```typescript
function getFlavorIntensity(tasting, flavor): number {
  // 1. Check explicit intensity ratings
  // 2. Calculate from tasting ratings
  // 3. Default to medium intensity (5)
  // 4. Normalize to 0-10 scale
}
```

### 4. Hierarchical Aggregation
```typescript
function convertToWheelData(analysis, config): FlavorWheelData[] {
  // 1. Group by category
  // 2. Calculate percentages and averages
  // 3. Build subcategory structure
  // 4. Sort by frequency/importance
}
```

## Output Formats

### 1. Interactive Sunburst Visualization
**Technology**: D3.js sunburst chart
**Features**:
- Hierarchical ring structure
- Color-coded categories
- Intensity-based opacity
- Responsive scaling
- Touch-friendly interactions

### 2. Export Capabilities
- **SVG**: Scalable vector graphics for publications
- **PNG**: Raster images for sharing
- **JSON**: Raw data for further analysis

### 3. Accessibility Features
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes

## Visualization Logic

### Color Mapping Algorithm
```typescript
function colorForNode(node): string {
  // 1. Determine category from hierarchy
  // 2. Apply base category color
  // 3. Adjust brightness by depth level
  // 4. Return hex color value
}
```

### Layout Calculation
```typescript
// D3 Partition Layout
const layout = d3.partition()
  .size([2 * Math.PI, hierarchyHeight + 1])

// Scales for positioning
const x = d3.scaleLinear()
  .domain([focus.x0, focus.x1])
  .range([0, 2 * Math.PI])

const y = d3.scaleSqrt()
  .domain([0, root.y1])
  .range([60, radius * 0.8]) // Visible range
```

### Animation System
- **Focus Transitions**: Smooth zoom between hierarchy levels
- **Hover Effects**: Subtle opacity and stroke changes
- **Loading States**: Progressive disclosure of segments
- **Reduced Motion**: Respects user accessibility preferences

## Advanced Features

### 1. Real-time Processing
- **Live Updates**: Flavor wheel updates as data is entered
- **Progressive Enhancement**: Handles partial data gracefully
- **Error Recovery**: Continues processing with missing data

### 2. Cultural Intelligence
- **Mexican Beverage Focus**: Specialized categories for mezcal, tequila, sotol
- **Regional Variations**: Terroir-specific flavor profiles
- **Traditional Ingredients**: Authentic Mexican flavor vocabulary

### 3. Performance Optimizations
- **Lazy Loading**: Components load on demand
- **Memoization**: Expensive calculations cached
- **Virtual Scrolling**: Large datasets handled efficiently
- **Progressive Rendering**: Large wheels render incrementally

## Integration Points

### Database Schema
```sql
-- Key tables supporting flavor wheel system
flavor_keyword_variants (variant, keyword_id, language)
flavor_keywords (category, subcategory, intensity_weight)
tastings (notes, ratings, tasting_items)
tasting_items (name, description, images)
```

### API Endpoints
- `/api/flavor-analysis/generate`: Generate wheel from tasting data
- `/api/flavor-dictionary/lookup`: Keyword matching service
- `/api/templates`: Template management
- `/api/export`: Data export functionality

### Real-time Features
- **Live Collaboration**: Multiple users can contribute to same tasting
- **Instant Updates**: Flavor wheel updates in real-time
- **Sync Across Devices**: Consistent experience on all platforms

## Quality Assurance

### Data Validation
- **Type Safety**: TypeScript interfaces for all data structures
- **Input Sanitization**: Text processing removes invalid characters
- **Range Validation**: Intensity values constrained to valid ranges
- **Schema Validation**: JSON schemas for API responses

### Error Handling
- **Graceful Degradation**: System continues with partial failures
- **User Feedback**: Clear error messages and recovery options
- **Logging**: Comprehensive error tracking for debugging
- **Fallbacks**: Alternative processing paths for edge cases

This flavor wheel creation system represents a sophisticated blend of natural language processing, data visualization, and cultural expertise, designed specifically for the unique challenges and opportunities of beverage tasting analysis.
